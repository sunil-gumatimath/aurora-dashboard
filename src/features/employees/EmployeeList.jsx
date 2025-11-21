import React, { useState, useMemo } from "react";
import { UserPlus, Users } from "lucide-react";
import "./employees-styles.css";
import { employees } from "../../data/employees";

const EmployeeList = () => {
	const [searchTerm, setSearchTerm] = useState("");

	const filteredEmployees = useMemo(() => {
		const term = searchTerm.toLowerCase();
		return employees.filter(
			(emp) =>
				emp.name.toLowerCase().includes(term) ||
				emp.role.toLowerCase().includes(term) ||
				emp.department.toLowerCase().includes(term),
		);
	}, [searchTerm]);

	const getStatusClass = (status) => {
		switch (status) {
			case "Active":
				return "active";
			case "On Leave":
				return "leave";
			default:
				return "offline";
		}
	};

	return (
		<div className="employees-container">
			<div className="employees-header">
				<input
					type="text"
					placeholder="Search employees by name, role, or department..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="employees-search"
				/>
				<button
					type="button"
					className="btn btn-primary"
					onClick={() => alert("Add Employee modal would open here")}
				>
					<UserPlus size={18} />
					<span>Add Employee</span>
				</button>
			</div>

			{filteredEmployees.length > 0 ? (
				<div className="employees-grid">
					{filteredEmployees.map((employee) => (
						<div key={employee.id} className="card employee-card">
							<div className="employee-card-header">
								<div className="employee-info">
									<img
										src={employee.avatar}
										alt={employee.name}
										className="employee-avatar"
									/>
									<div className="employee-details">
										<h3>{employee.name}</h3>
										<p>{employee.role}</p>
									</div>
								</div>
								<span
									className={`employee-status-badge ${getStatusClass(employee.status)}`}
								>
									{employee.status}
								</span>
							</div>

							<div className="employee-meta">
								<div className="employee-meta-row">
									<span className="employee-meta-label">Department</span>
									<span className="employee-meta-value">{employee.department}</span>
								</div>
								<div className="employee-meta-row">
									<span className="employee-meta-label">Email</span>
									<span className="employee-meta-value">{employee.email}</span>
								</div>
							</div>

							<div className="employee-actions">
								<button
									type="button"
									className="employee-action-btn"
									onClick={() => alert(`Edit ${employee.name}`)}
								>
									Edit
								</button>
								<button
									type="button"
									className="employee-action-btn danger"
									onClick={() =>
										confirm(`Are you sure you want to delete ${employee.name}?`)
									}
								>
									Delete
								</button>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="card employees-empty">
					<Users size={64} className="employees-empty-icon" />
					<h3 className="employees-empty-title">No employees found</h3>
					<p className="employees-empty-description">
						{searchTerm
							? `No employees match "${searchTerm}". Try a different search term.`
							: "No employees in the system yet. Add your first employee to get started."}
					</p>
				</div>
			)}
		</div>
	);
};

export default React.memo(EmployeeList);
