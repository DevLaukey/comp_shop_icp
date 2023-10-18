
# Computer Shop Inventory System.

The project is used to manage small to large computer shops. It manages the Inventory while leveraging on the benefits of blockchain.



## Functions

#### getComputers()

```
  Retrieves all computers in the inventory.
```


#### getComputer(id: string)

```
 Retrieves a computer by its ID.
```

#### addComputer(payload: ComputerPayload)

```
 Adds a new computer to the inventory.
```


#### updateComputer(id: string, payload: ComputerPayload)

```
 Updates the details of an existing computer.

```


#### deleteComputer(id: string)

```
  Deletes a computer from the inventory.

```


#### sellComputer(id: string, quantitySold: number)

```
 Updates the quantity of a computer after a sale.

```

#### searchComputers(query: string)

```
Searches for computers based on a query string

```

#### checkLowStock()
```
 Checks for low-stock computers (quantity less than 5).

```
