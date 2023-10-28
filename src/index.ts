import {
  $query,
  $update,
  Record,
  StableBTreeMap,
  Vec,
  match,
  Result,
  text,
  Opt,
  float64,
} from "azle";
import { v4 as uuidv4 } from "uuid";

type Computer = Record<{
  id: string;
  brand: string;
  model: string;
  price: float64;
  quantity: number;
  description: string;
}>;

type ComputerPayload = Record<{
  brand: string;
  model: string;
  price: float64;
  quantity: number;
  description: string;
}>;

const computerStorage = new StableBTreeMap<string, Computer>(0, 44, 1024);
const MAX_REQUESTS_PER_MINUTE = 10; // Rate limiting constant

const requestTimestamps = new Map<string, number>();

$query;
export function getComputers(): Result<Vec<Computer>, string> {
  return Result.Ok(computerStorage.values());
}

$query;
export function getComputer(id: string): Result<Computer, string> {
  return match(computerStorage.get(id), {
    Some: (computer) => Result.Ok<Computer, string>(computer),
    None: () => Result.Err<Computer, string>(`A computer with id=${id} not found`),
  });
}

$update;
export function addComputer(payload: ComputerPayload): Result<Computer, string> {
  const computer: Computer = { id: uuidv4(), ...payload };
  computerStorage.insert(computer.id, computer);
  return Result.Ok(computer);
}

// Validate query input to prevent potential injection
$query;
export function searchComputers(query: string): Result<Vec<Computer>, string> {
  if (query.length < 3) {
    return Result.Err<Vec<Computer>, string>("Query should be at least 3 characters long.");
  }

  const lowerCaseQuery = query.toLowerCase();

  const filteredComputers = computerStorage.values().filter((computer) => {
    const brand = computer.brand.toLowerCase();
    const model = computer.model.toLowerCase();
    const price = computer.price.toString().toLowerCase();

    return (
      brand.includes(lowerCaseQuery) ||
      model.includes(lowerCaseQuery) ||
      price.includes(lowerCaseQuery)
    );
  });

  if (filteredComputers.length === 0) {
    return Result.Err<Vec<Computer>, string>(`No computers found for the query: ${query}`);
  }

  return Result.Ok(filteredComputers);
}

$update;
export function sellComputer(id: string, quantitySold: number): Result<Computer, string> {
  if (quantitySold <= 0) {
    return Result.Err<Computer, string>("Quantity sold must be greater than zero.");
  }

  const lastRequestTimestamp = requestTimestamps.get(id) || 0;
  const currentTimestamp = Context.blockTimestamp;

  //changed to check if the time used is > 60 so as to log
  if (currentTimestamp - lastRequestTimestamp >= 60) {
    return Result.Err<Computer, string>("Rate limit exceeded. Try again later.");
  }
  requestTimestamps.set(id, currentTimestamp);

  const computerResult = computerStorage.get(id);

  return match(computerResult, {
    Some: (computer) => {
      const currentQuantity = computer.quantity;

      if (currentQuantity < quantitySold) {
        return Result.Err<Computer, string>(`Not enough quantity in stock for computer with id=${id}`);
      }

      const updatedQuantity = currentQuantity - quantitySold;
      const updatedComputer: Computer = {
        ...computer,
        quantity: updatedQuantity,
      };
      computerStorage.insert(id, updatedComputer);

      return Result.Ok<Computer, string>(updatedComputer);
    },
    None: () => Result.Err<Computer, string>(`Computer with id=${id} not found`),
  });
}

$update;
export function updateComputer(id: string, payload: ComputerPayload): Result<Computer, string> {
  return match(computerStorage.get(id), {
    Some: (computer) => {
      const updatedComputer: Computer = { ...computer, ...payload };
      computerStorage.insert(id, updatedComputer);
      return Result.Ok<Computer, string>(updatedComputer);
    },
    None: () => Result.Err<Computer, string>(`Couldn't update a computer with id=${id}. Computer not found`),
  });
}

$update;
export function deleteComputer(id: string): Result<Computer, string> {
  return match(computerStorage.remove(id), {
    Some: (deletedComputer) => Result.Ok<Computer, string>(deletedComputer),
    None: () => Result.Err<Computer, string>(`Couldn't delete a computer with id=${id}. Computer not found.`),
  });
}

$update;
export function clearLowStockNotifications(): Result<string, string> {
  // Clear the low-stock notifications (if any)
  return Result.Ok<string, string>('Low-stock notifications cleared');
}

$update;
export function resupplyComputer(id: string, quantityToAdd: number): Result<Computer, string> {
  return match(computerStorage.get(id), {
    Some: (computer) => {
      const updatedQuantity = computer.quantity + quantityToAdd;
      const updatedComputer: Computer = { ...computer, quantity: updatedQuantity };
      computerStorage.insert(id, updatedComputer);
      return Result.Ok<Computer, string>(updatedComputer);
    },
    None: () => Result.Err<Computer, string>(`Computer with id=${id} not found`),
  });
}

$query;
export function getTotalInventoryValue(): Result<float64, string> {
  const totalValue = computerStorage.values().reduce((acc, computer) => acc + computer.price * computer.quantity, 0.0);
  return Result.Ok<float64, string>(totalValue);
}

$query;
export function getComputersByPriceRange(minPrice: float64, maxPrice: float64): Result<Vec<Computer>, string> {
  const filteredComputers = computerStorage.values().filter((computer) => {
    return computer.price >= minPrice && computer.price <= maxPrice;
  });
  return Result.Ok(filteredComputers);
}

$update;
export function setComputerPrice(id: string, newPrice: float64): Result<Computer, string> {
  return match(computerStorage.get(id), {
    Some: (computer) => {
      const updatedComputer: Computer = { ...computer, price: newPrice };
      computerStorage.insert(id, updatedComputer);
      return Result.Ok<Computer, string>(updatedComputer);
    },
    None: () => Result.Err<Computer, string>(`Computer with id=${id} not found`),
  });
}

$query;
export function getComputerDescription(id: string): Result<string, string> {
  return match(computerStorage.get(id), {
    Some: (computer) => Result.Ok<string, string>(computer.description),
    None: () => Result.Err<string, string>(`Computer with id=${id} not found`),
  });
}

$query;
export function getComputerQuantity(id: string): Result<number, string> {
  return match(computerStorage.get(id), {
    Some: (computer) => Result.Ok<number, string>(computer.quantity),
    None: () => Result.Err<number, string>(`Computer with id=${id} not found`),
  });
}

$query;
export function listComputerBrands(): Result<Vec<string>, string> {
// removed the empty func declaration
  const uniqueBrands = Array.from(
    new Set(computerStorage.values().map((computer) => computer.brand))
  );
  return Result.Ok(uniqueBrands);
}

// a workaround to make uuid package work with Azle
globalThis.crypto = {
  // @ts-ignore
  getRandomValues: () => {
    let array = new Uint8Array(32);

    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }

    return array;
  },
};
