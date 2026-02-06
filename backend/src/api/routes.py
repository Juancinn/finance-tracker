from flask import Blueprint, request, jsonify
import os
import tempfile
from ..data.repository import SqliteRepository
from ..domain.services import TransactionService
from ..data.importer import CibcImporter

# Define the Blueprint
api_bp = Blueprint('api', __name__)

# CONFIG & INJECTION
# We look for finance.db in the 'backend' root folder (../../finance.db)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, 'finance.db')

repo = SqliteRepository(DB_PATH)
service = TransactionService(repo)

# --- TRANSACTIONS ---

@api_bp.route('/transactions', methods=['GET'])
def get_transactions():
    start = request.args.get('start')
    end = request.args.get('end')
    data = repo.get_transactions(user_id=1, start_date=start, end_date=end)
    return jsonify(data)

@api_bp.route('/transactions', methods=['POST'])
def create_transaction():
    data = request.json
    service.import_transactions([data], user_id=1)
    return jsonify({"status": "success"}), 201

@api_bp.route('/transactions/<int:tx_id>', methods=['PUT'])
def update_transaction(tx_id):
    data = request.json
    updates = {}
    if 'category' in data: updates['category'] = data['category']
    if 'subcategory' in data: updates['subcategory'] = data['subcategory']
    if 'description' in data: updates['description'] = data['description']
    
    if updates:
        repo.update_transaction(tx_id, 1, updates)
    return jsonify({"status": "updated"})

@api_bp.route('/transactions/<int:tx_id>/split', methods=['POST'])
def split_transaction(tx_id):
    data = request.json
    try:
        amount = float(data.get('amount', 0))
        service.split_transaction(tx_id, amount, user_id=1)
        return jsonify({"status": "split success"})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

# --- CATEGORIES ---

@api_bp.route('/categories', methods=['GET'])
def get_categories():
    data = repo.get_categories(user_id=1)
    return jsonify(data)

@api_bp.route('/categories', methods=['POST'])
def create_category():
    data = request.json
    try:
        repo.create_category(data['name'], data['type'], user_id=1)
        return jsonify({"status": "created"}), 201
    except Exception as e:
        return jsonify({"error": "Category likely exists"}), 400

@api_bp.route('/categories/<name>', methods=['DELETE'])
def delete_category(name):
    repo.delete_category(name, user_id=1)
    return jsonify({"status": "deleted"})

@api_bp.route('/categories/<name>', methods=['PUT'])
def update_category(name):
    data = request.json
    if 'new_name' in data:
        repo.update_category_name(name, data['new_name'], user_id=1)
    if 'type' in data:
        repo.update_category_type(name, data['type'], user_id=1)
    return jsonify({"status": "updated"})

# --- RULES ---

@api_bp.route('/rules', methods=['GET'])
def get_rules():
    return jsonify(repo.get_rules(user_id=1))

@api_bp.route('/rules', methods=['POST'])
def create_rule():
    data = request.json
    repo.create_rule(data['keyword'], data['category'], user_id=1)
    return jsonify({"status": "rule created"}), 201

# --- IMPORT (WEB) ---

@api_bp.route('/import', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    fd, temp_path = tempfile.mkstemp(suffix=".csv")
    try:
        with os.fdopen(fd, 'wb') as tmp:
            file.save(tmp)
            
        filename = file.filename.lower()
        account_type = None
        if "chequing" in filename: account_type = "Chequing"
        elif "credit" in filename or "visa" in filename: account_type = "Visa"
        elif "savings" in filename: account_type = "Savings"
            
        if not account_type:
            return jsonify({"error": "Could not determine account type from filename."}), 400
            
        importer = CibcImporter()
        raw_txns = importer.parse(temp_path, account_type)
        added_count = service.import_transactions(raw_txns, user_id=1)
        
        return jsonify({"message": f"Success. {added_count} new transactions added."}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)