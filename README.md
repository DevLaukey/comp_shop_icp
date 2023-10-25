
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
#### Resupply Computer Inventory:

resupplyComputer(id: string, quantityToAdd: number): Result<Computer, string>
Description: This function allows you to restock the inventory of a specific computer by adding a certain quantity of computers to it. It's useful for replenishing stock.
Get Total Inventory Value:

#### getTotalInventoryValue(): Result<float64, string>
Description: This function calculates and returns the total value of the entire computer inventory. It's helpful for assessing the overall worth of the inventory.
Get Computers by Price Range:

#### getComputersByPriceRange(minPrice: float64, maxPrice: float64): Result<Vec<Computer>, string>
Description: This function allows you to retrieve a list of computers within a specified price range. It's useful for customers looking for computers within a certain budget.
Clear Low Stock Notifications:

#### clearLowStockNotifications(): Result<string, string>
Description: This function can be used to clear the low stock notifications, effectively resetting them. It's helpful for periodic maintenance.
Get Computer Description:

#### getComputerDescription(id: string): Result<string, string>
Description: This function retrieves the description of a computer based on its ID. It's helpful for providing detailed information about a specific computer.

#### Set Computer Price:
setComputerPrice(id: string, newPrice: float64): Result<Computer, string>
Description: This function allows you to change the price of a specific computer by providing its ID and the new price.
Get Computer Quantity:

#### getComputerQuantity(id: string): Result<number, string>
Description: This function allows you to retrieve the quantity of a specific computer based on its ID.
List Computer Brands:

#### listComputerBrands(): Result<Vec<string>, string>
Description: This function returns a list of unique computer brands available in the inventory.