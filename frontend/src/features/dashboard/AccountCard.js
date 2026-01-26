import React from 'react';
import { useAccountStats } from '../../hooks/useAccountStats';
import { TransactionTable } from '../../components/TransactionTable';

export const AccountCard = ({ title, accountType, allTransactions }) => {

  const { transactions, totalIn, totalOut, netChange } = useAccountStats(allTransactions, accountType);

  const isCredit = accountType === 'Visa';
  const labels = {
    in: isCredit ? "Paid Off" : "Deposited",
    out: isCredit ? "Spent" : "Withdrawn"
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={{ margin: "0 0 10px 0", color: "#333" }}>{title}</h2>
        <div style={styles.grid}>
          <StatBox label="Net Change" value={netChange} isNet={true} />
          <StatBox label={labels.in} value={totalIn} color="green" />
          <StatBox label={labels.out} value={totalOut} color="red" />
        </div>
      </div>

      <TransactionTable transactions={transactions} />
    </div>
  );
};

const StatBox = ({ label, value, color, isNet }) => {
  const displayColor = isNet ? (value >= 0 ? "green" : "red") : color;
  const prefix = isNet ? (value >= 0 ? "+" : "-") : (color === "red" ? "-" : "+");
  
  return (
    <div style={styles.statBox}>
      <div style={styles.label}>{label}</div>
      <div style={{ fontWeight: "bold", color: displayColor }}>
        {prefix}${Math.abs(value).toFixed(2)}
      </div>
    </div>
  );
};

const styles = {
  card: { background: "white", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "20px" },
  header: { borderBottom: "2px solid #ddd", paddingBottom: "10px", marginBottom: "10px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", textAlign: "center" },
  statBox: { background: "#f9f9f9", padding: "8px", borderRadius: "6px" },
  label: { fontSize: "11px", color: "#888", textTransform: "uppercase" }
};