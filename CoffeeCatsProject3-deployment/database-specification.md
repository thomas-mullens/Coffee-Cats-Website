Current database specification

```sql
-- This script should be run in the PostgreSQL database to create the tables needed for the application.

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(25) NOT NULL
);

-- Food inventory table
CREATE TABLE IF NOT EXISTS inventory (
    name VARCHAR(25) PRIMARY KEY,
    quantity INT NOT NULL,
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL,
    order_time TIMESTAMP NOT NULL,
    isactive BOOLEAN,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
    name VARCHAR(25) PRIMARY KEY,
    price DECIMAL(5, 2) NOT NULL,
    category VARCHAR(25) NOT NULL
);

-- Create a new table for menu item ingredients
CREATE TABLE IF NOT EXISTS menu_item_ingredients (
    menu_item VARCHAR(25),
    inventory_item VARCHAR(25),
    quantity INT NOT NULL,
    PRIMARY KEY (menu_item, inventory_item),
    FOREIGN KEY (menu_item) REFERENCES menu_items(name),
    FOREIGN KEY (inventory_item) REFERENCES inventory(name)
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item VARCHAR(25),
    quantity INT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item) REFERENCES menu_items(name) ON DELETE CASCADE
);
```