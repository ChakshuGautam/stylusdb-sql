## SQL Query Engine over CSV in JavaScript

Let's start building a SQL query engine over CSV in JavaScript. We'll use Node.js for this project.

This project will be complete in 20 steps and will take about 2-20 hours to complete depending on your level of expertise.

- [x] Step 1: Setting up the Project
- [x] Step 2: Create a CSV Reading Function
- [x] Step 3: Building a Basic SQL Query Parser
- [x] Step 4: Integrating CSV Reading with Query Parsing
- [x] Step 5: Adding Support for WHERE Clauses
- [x] Step 6: Handling multiple conditions in WHERE clause
- [x] Step 7: Handling Different Comparison Operators
- [x] Step 8: Adding INNER JOIN support
- [x] Step 9: Adding LEFT and RIGHT JOIN support
- [x] Step 10: Group By and Aggregate Functions
- [x] Step 11: Implementing ORDER BY Clause
- [x] Step 12: Adding LIMIT Clause
- [x] Step 13: Error Handling and Validation
- [x] Step 14: Implementing DISTINCT Keyword
- [x] Step 15: Adding Support for LIKE Operator
- [x] Step 16: Adding CI Support
- [x] Step 17: Basic INSERT Statement Support
- [x] Step 18: Basic DELETE Statement Support
- [x] Step 19: CLI Integration
- [x] Step 20: Packaging and Publishing


## Refactoring and Code Cleanup
This will be done post Step 20 to ensure that the code is clean and readable. This will also be a good time to add tests and documentation.


## Next Steps
There is a laundry list of features and improvements that can be added to this project. Here are some ideas for further development. The objective is to always add more features in a similar format - A tutorial-style guide with step-by-step instructions. A lot of these are challenging and should be broken down into smaller steps.

- [ ] Implementing SET Operations (UNION, INTERSECT, EXCEPT)
- [ ] INSERT Statement Support: Implement the capability to insert new data into existing CSV files. This includes parsing INSERT SQL statements and updating the CSV file while ensuring data integrity.
- [ ] Enhancing the Parser for Subqueries
- [ ] Data Update and Delete Operations: Along with INSERT, support UPDATE and DELETE operations. This allows for full data manipulation capabilities, similar to a traditional database.
- [ ] Schema Definition and Evolution: Provide functionality for defining a schema for CSV files (column names, data types, etc.) and mechanisms to evolve the schema over time (adding/removing columns, changing data types).
- [ ] Schema Validation: Include features to validate data against the defined schema during insertions and updates, ensuring data quality and consistency.
Data Integrity Constraints: Implement constraints like primary keys, unique constraints, and foreign keys. This would require additional logic for constraint enforcement during data modifications.
- [ ] ACID Properties Compliance: Aim to bring the system closer to compliance with ACID (Atomicity, Consistency, Isolation, Durability) properties, enhancing its reliability and robustness.
- [ ] Data Compression and Storage Optimization: Introduce data compression techniques to reduce the storage footprint of CSV files, especially important for large datasets.
- [ ] Bulk Data Insertion and Modification: Develop functionality for handling bulk data operations efficiently, which is crucial for large-scale data processing.
- [ ] Data Partitioning and Sharding: Implement data partitioning and sharding for handling very large CSV files, improving performance and manageability.
- [ ] Row-level Security: Add features for row-level security to restrict data access at a granular level, based on user roles or other criteria.
- [ ] High Availability and Fault Tolerance: Build mechanisms for ensuring high availability and fault tolerance, such as replicating data across multiple locations.
- [ ] Data Auditing Features: Introduce data auditing capabilities to track who made what changes and when, which is important for compliance and security.
- [ ] Disaster Recovery Mechanisms: Develop a system for backing up data and schemas, along with recovery procedures in case of data loss or corruption. This could involve regular snapshots of the CSV files and schema definitions.
- [ ] Transaction Log for Data Recovery: Maintain a transaction log to record all data manipulation operations. This can be used for point-in-time recovery and auditing purposes.
- [ ] Support for Indexing: Develop advanced indexing mechanisms like B-trees or hash indexes for faster query processing. This can significantly improve the performance of SELECT queries, especially on large CSV files.
- [ ] Query Optimization Engine: Implement a query optimizer that rewrites queries for optimal execution. This could include optimizing join orders, using indexes effectively, or simplifying complex queries.
- [ ] Custom Function Support: Allow users to define custom functions in JavaScript that can be used within SQL queries. This would add a layer of flexibility and power to the query engine.
- [ ] Data Type Casting and Conversion: Implement features for automatic or manual data type casting and conversion. This is crucial for handling different data types present in CSV files.
- [ ] Parallel Query Processing: Introduce multi-threading or parallel processing capabilities to handle large datasets more efficiently. This would enable the engine to execute multiple parts of a query in parallel, reducing overall query time.
- [ ] Custom Function Support: Allow users to define custom functions in JavaScript that can be used within SQL queries. This would add a layer of flexibility and power to the query engine.
- [ ] Regular Expression Support in Queries: Add support for using regular expressions in WHERE clauses, providing more powerful data filtering capabilities.
- [ ] Full-text Search Capability: Incorporate a full-text search feature, which is essential for efficiently searching through large text data.
- [ ] Data Import/Export Features: Allow importing data from and exporting data to different formats like JSON, XML, or even other databases.
- [ ] Performance Monitoring: Develop a system for monitoring query performance and logging slow queries. This could help in identifying bottlenecks and areas for improvement.
- [ ] Automatic Query Caching: Implement a caching mechanism that automatically caches frequent queries or query results for faster retrieval.
- [ ] Support for Transactions: Add basic transaction support with features like commit, rollback, and transaction logs. This would be particularly challenging but also a unique feature for a CSV-based query engine.
- [ ] Advanced Analytics: Incorporate more complex statistical functions and operations, making the engine useful for data analysis tasks.
- [ ] Security Features: Implement security features like query validation, SQL injection prevention, and access control mechanisms.
- [ ] Optimized Storage Formats: Add support for optimized storage formats for CSV files, like columnar storage, to enhance read performance.

### Process to a new step
This project is built to be understood by someone with basic knowledge of JavaScript and SQL and then following the steps. Ensure that the documentation is updated with each step and uses the same style, format, and structure as the previous steps. Best if it can use some of the older _gyan_ as well.

Checklist
- Find a feature that you would want to implement.
- Break it down into steps such that each step can be completed in at most 20 mins.
- Create a new GitHub issue for the feature.
- Get the issue reviewed and approved by a maintainer and get it assigned.
- Create a new branch for the step.
- Implement the step.
- Create a PR for the step.
- Get the implementation, tests and documentation approved.
- Get the PR merged.
    
