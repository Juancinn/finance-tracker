import sqlite3
import uuid
from flask import Flask, jsonify, request
from flask_cors import CORS
from collections import defaultdict

app = Flask(__name__)
CORS(app)

DB_FILE = "finance.db"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/transactions', methods=['GET'])
def get_transactions():
    start_date = request.args.get('start')
    end_date = request.args.get('end')
    
    conn = get_db_connection()
    if start_date and end_date:
        query = 'SELECT * FROM transactions WHERE date BETWEEN ? AND ? ORDER BY date DESC'
        rows = conn.execute(query, (start_date, end_date)).fetchall()
    else:
        rows = conn.execute('SELECT * FROM transactions ORDER BY date DESC').fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/transactions/<id>', methods=['PUT'])
def update_transaction(id):
    data = request.json
    conn = get_db_connection()
    
    category = data.get('category')
    
    if isinstance(category, list):
        category = ", ".join(category)
        
    try:
        conn.execute('UPDATE transactions SET category = ? WHERE id = ?',
                     (category, id))
        conn.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()

@app.route('/categories', methods=['GET'])
def get_categories():
    conn = get_db_connection()
    rows = conn.execute('SELECT name, type FROM categories ORDER BY name').fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/categories', methods=['POST'])
def add_category():
    data = request.json
    conn = get_db_connection()
    try:
        conn.execute('INSERT INTO categories (name, type) VALUES (?, ?)',
                     (data['name'], data['type']))
        conn.commit()
        return jsonify({"status": "success"})
    except sqlite3.IntegrityError:
        return jsonify({"status": "error", "message": "Category already exists"}), 400
    finally:
        conn.close()

@app.route('/categories/<name>', methods=['PUT'])
def update_category(name):
    data = request.json
    conn = get_db_connection()
    try:
        if 'new_name' in data:
            new_name = data['new_name']
            conn.execute('UPDATE categories SET name = ? WHERE name = ?', (new_name, name))
            conn.execute('UPDATE transactions SET category = ? WHERE category = ?', (new_name, name))
            conn.execute('UPDATE rules SET category = ? WHERE category = ?', (new_name, name))
        elif 'type' in data:
            conn.execute('UPDATE categories SET type = ? WHERE name = ?', (data['type'], name))
        conn.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()

@app.route('/categories/<name>', methods=['DELETE'])
def delete_category(name):
    conn = get_db_connection()
    try:
        conn.execute("UPDATE transactions SET category = 'Uncategorized' WHERE category = ?", (name,))
        conn.execute("DELETE FROM rules WHERE category = ?", (name,))
        conn.execute("DELETE FROM categories WHERE name = ?", (name,))
        conn.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()

@app.route('/rules', methods=['POST'])
def add_rule():
    data = request.json
    conn = get_db_connection()
    try:
        conn.execute('INSERT INTO rules (keyword, category) VALUES (?, ?)',
                     (data['keyword'], data['category']))
        
        keyword_pattern = f"%{data['keyword']}%"
        conn.execute('''
            UPDATE transactions 
            SET category = ? 
            WHERE description LIKE ? AND category = 'Uncategorized'
        ''', (data['category'], keyword_pattern))
        
        conn.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    finally:
        conn.close()

@app.route('/automation/recurring', methods=['GET'])
def get_recurring():
    conn = get_db_connection()
    rows = conn.execute('SELECT date, description, amount FROM transactions WHERE amount < 0').fetchall()
    conn.close()

    grouped = defaultdict(list)
    for row in rows:
        desc_key = row['description'].split()[0].upper() 
        grouped[desc_key].append(row)

    detected = []
    for desc, txns in grouped.items():
        if len(txns) > 1:
            amounts = [abs(t['amount']) for t in txns]
            avg_amt = sum(amounts) / len(amounts)
            if all(0.95 * avg_amt <= a <= 1.05 * avg_amt for a in amounts):
                detected.append({
                    "name": desc,
                    "avg_amount": round(avg_amt, 2),
                    "frequency": len(txns)
                })

    return jsonify(detected)

@app.route('/transactions/<id>/split', methods=['POST'])
def split_transaction(id):
    data = request.json
    try:
        split_amount = float(data.get('amount'))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid amount"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT * FROM transactions WHERE id = ?", (id,))
    orig = cur.fetchone()
    
    if not orig:
        conn.close()
        return jsonify({"error": "Transaction not found"}), 404
        
    orig_amount = orig['amount']
    
    if abs(split_amount) >= abs(orig_amount):
        conn.close()
        return jsonify({"error": "Split amount cannot exceed original amount"}), 400
    
    sign = 1 if orig_amount >= 0 else -1
    abs_split = abs(split_amount)
    
    new_split_val = abs_split * sign
    remainder_val = orig_amount - new_split_val
    
    cur.execute("UPDATE transactions SET amount = ? WHERE id = ?", (remainder_val, id))
    
    new_id = str(uuid.uuid4())
    new_desc = f"{orig['description']} (Split)"
    
    cur.execute("""
        INSERT INTO transactions (id, date, description, amount, currency, account_type, category)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (new_id, orig['date'], new_desc, new_split_val, orig['currency'], orig['account_type'], 'Uncategorized'))
    
    conn.commit()
    conn.close()
    
    return jsonify({"status": "success", "message": "Transaction split successfully"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)