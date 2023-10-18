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

$query;
export function getComputers(): Result<Vec<Computer>, string> {
  return Result.Ok(computerStorage.values());
}

$query;
export function getComputer(id: string): Result<Computer, string> {
  return match(computerStorage.get(id), {
    Some: (computer) => Result.Ok<Computer, string>(computer),
    None: () =>
      Result.Err<Computer, string>(`A computer with id=${id} not found`),
  });
}

$update;
export function addComputer(
  payload: ComputerPayload
): Result<Computer, string> {
  const computer: Computer = { id: uuidv4(), ...payload };
  computerStorage.insert(computer.id, computer);
  return Result.Ok(computer);
}

$update;
export function updateComputer(
  id: string,
  payload: ComputerPayload
): Result<Computer, string> {
  return match(computerStorage.get(id), {
    Some: (computer) => {
      const updatedComputer: Computer = { ...computer, ...payload };
      computerStorage.insert(computer.id, updatedComputer);
      return Result.Ok<Computer, string>(updatedComputer);
    },
    None: () =>
      Result.Err<Computer, string>(
        `Couldn't update a computer with id=${id}. Computer not found`
      ),
  });
}

$update;
export function deleteComputer(id: string): Result<Computer, string> {
  return match(computerStorage.remove(id), {
    Some: (deletedComputer) => Result.Ok<Computer, string>(deletedComputer),
    None: () =>
      Result.Err<Computer, string>(
        `Couldn't delete a computer with id=${id}. Computer not found.`
      ),
  });
}

$update;
export function sellComputer(
  id: string,
  quantitySold: number
): Result<Computer, string> {
  const computerResult = computerStorage.get(id);

  return match(computerResult, {
    Some: (computer) => {
      const currentQuantity = computer.quantity;

      if (currentQuantity < quantitySold) {
        return Result.Err<Computer, string>(
          `Not enough quantity in stock for computer with id=${id}`
        );
      }

      const updatedQuantity = currentQuantity - quantitySold;
      const updatedComputer: Computer = {
        ...computer,
        quantity: updatedQuantity,
      };
      computerStorage.insert(id, updatedComputer);

      return Result.Ok<Computer, string>(updatedComputer);
    },
    None: () =>
      Result.Err<Computer, string>(`Computer with id=${id} not found`),
  });
}

$query;
export function searchComputers(query: string): Result<Vec<Computer>, string> {
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
    return Result.Err<Vec<Computer>, string>(
      `No computers found for the query: ${query}`
    );
  }

  return Result.Ok(filteredComputers);
}

$update;
export function checkLowStock(): Result<Vec<string>, string> {
  const lowStockNotification: string[] = [];

  computerStorage.values().forEach((computer) => {
    if (computer.quantity < 5) {
      lowStockNotification.push(
        `Low stock for ${computer.brand} ${computer.model}. Current quantity: ${computer.quantity}`
      );
    }
  });

  if (lowStockNotification.length === 0) {
    return Result.Ok<Vec<string>, string>(["No low-stock notifications"]);
  }

  return Result.Ok<Vec<string>, string>(lowStockNotification);
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
