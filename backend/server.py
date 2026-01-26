import sqlite3
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
    conn.execute('UPDATE transactions SET category = ? WHERE id = ?',
                 (data.get('category'), id))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)