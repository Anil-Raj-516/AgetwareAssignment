// File: app.js

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");
const app = express();
const PORT = 3000;

app.use(express.json());

// Database Setup
const db = new sqlite3.Database("./bank.db", (err) => {
  if (err) return console.error("Database opening error:", err.message);
  console.log("Connected to SQLite database");
});

// Create Tables
const createTables = () => {
  db.run(`CREATE TABLE IF NOT EXISTS Customers (
    customer_id TEXT PRIMARY KEY,
    name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Loans (
    loan_id TEXT PRIMARY KEY,
    customer_id TEXT,
    principal_amount REAL,
    total_amount REAL,
    interest_rate REAL,
    loan_period_years INTEGER,
    monthly_emi REAL,
    status TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES Customers(customer_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Payments (
    payment_id TEXT PRIMARY KEY,
    loan_id TEXT,
    amount REAL,
    payment_type TEXT,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(loan_id) REFERENCES Loans(loan_id)
  )`);
};

createTables();

// Utility Function: Calculate Loan Details
const calculateLoanDetails = (P, N, R) => {
  const interest = P * N * (R / 100);
  const total = P + interest;
  const emi = total / (N * 12);
  return { total, emi };
};

// POST /loans - Create new loan
app.post("/api/v1/loans", (req, res) => {
  const { customer_id, loan_amount, loan_period_years, interest_rate_yearly } = req.body;
  if (!customer_id || !loan_amount || !loan_period_years || !interest_rate_yearly) {
    return res.status(400).send({ error: "Missing required fields" });
  }
  const { total, emi } = calculateLoanDetails(loan_amount, loan_period_years, interest_rate_yearly);
  const loan_id = uuidv4();

  const query = `INSERT INTO Loans (loan_id, customer_id, principal_amount, total_amount, interest_rate, loan_period_years, monthly_emi, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`;
  db.run(
    query,
    [loan_id, customer_id, loan_amount, total, interest_rate_yearly, loan_period_years, emi],
    function (err) {
      if (err) return res.status(500).send({ error: err.message });
      return res.status(201).send({
        loan_id,
        customer_id,
        total_amount_payable: total,
        monthly_emi: emi,
      });
    }
  );
});

// POST /loans/:loan_id/payments - Record a payment
app.post("/api/v1/loans/:loan_id/payments", (req, res) => {
  const { amount, payment_type } = req.body;
  const { loan_id } = req.params;
  if (!amount || !payment_type) return res.status(400).send({ error: "Invalid request" });

  db.get("SELECT * FROM Loans WHERE loan_id = ?", [loan_id], (err, loan) => {
    if (err || !loan) return res.status(404).send({ error: "Loan not found" });

    const payment_id = uuidv4();
    db.run(
      `INSERT INTO Payments (payment_id, loan_id, amount, payment_type) VALUES (?, ?, ?, ?)`,
      [payment_id, loan_id, amount, payment_type],
      function (err) {
        if (err) return res.status(500).send({ error: err.message });

        db.all(
          `SELECT SUM(amount) as total_paid FROM Payments WHERE loan_id = ?`,
          [loan_id],
          (err, rows) => {
            const total_paid = rows[0].total_paid || 0;
            const remaining = loan.total_amount - total_paid;
            const emis_left = Math.ceil(remaining / loan.monthly_emi);

            res.status(200).send({
              payment_id,
              loan_id,
              message: "Payment recorded successfully.",
              remaining_balance: remaining,
              emis_left,
            });
          }
        );
      }
    );
  });
});

// GET /loans/:loan_id/ledger - View ledger
app.get("/api/v1/loans/:loan_id/ledger", (req, res) => {
  const { loan_id } = req.params;

  db.get("SELECT * FROM Loans WHERE loan_id = ?", [loan_id], (err, loan) => {
    if (err || !loan) return res.status(404).send({ error: "Loan not found" });

    db.all(
      `SELECT * FROM Payments WHERE loan_id = ? ORDER BY payment_date`,
      [loan_id],
      (err, transactions) => {
        db.get(
          `SELECT SUM(amount) as total_paid FROM Payments WHERE loan_id = ?`,
          [loan_id],
          (err, row) => {
            const paid = row.total_paid || 0;
            const balance = loan.total_amount - paid;
            const emis_left = Math.ceil(balance / loan.monthly_emi);

            res.send({
              loan_id,
              customer_id: loan.customer_id,
              principal: loan.principal_amount,
              total_amount: loan.total_amount,
              monthly_emi: loan.monthly_emi,
              amount_paid: paid,
              balance_amount: balance,
              emis_left,
              transactions,
            });
          }
        );
      }
    );
  });
});

// GET /customers/:customer_id/overview - Overview for customer
app.get("/api/v1/customers/:customer_id/overview", (req, res) => {
  const { customer_id } = req.params;

  db.all("SELECT * FROM Loans WHERE customer_id = ?", [customer_id], (err, loans) => {
    if (err || loans.length === 0) return res.status(404).send({ error: "No loans found" });

    const overview = loans.map((loan) => {
      return new Promise((resolve) => {
        db.get(
          `SELECT SUM(amount) as paid FROM Payments WHERE loan_id = ?`,
          [loan.loan_id],
          (err, row) => {
            const paid = row.paid || 0;
            const interest = loan.total_amount - loan.principal_amount;
            resolve({
              loan_id: loan.loan_id,
              principal: loan.principal_amount,
              total_amount: loan.total_amount,
              total_interest: interest,
              emi_amount: loan.monthly_emi,
              amount_paid: paid,
              emis_left: Math.ceil((loan.total_amount - paid) / loan.monthly_emi),
            });
          }
        );
      });
    });

    Promise.all(overview).then((data) => {
      res.send({
        customer_id,
        total_loans: loans.length,
        loans: data,
      });
    });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
