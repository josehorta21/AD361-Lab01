// Change only this path to "./receipt" for the original-code run.
// Restore "./fixed_receipt" before the final run and submission.
const loadReceipt = () => import("./fixed_receipt");
let receipt: Awaited<ReturnType<typeof loadReceipt>>;

const initialNames = ["paper towels", "sandwich", "eggs", "avocado oil"];

beforeEach(async () => {
  // A fresh module gives every test its own original four-item list.
  jest.resetModules();
  receipt = await loadReceipt();
});

afterEach(() => {
  jest.restoreAllMocks();
});

function emptyList(): void {
  for (const name of initialNames) {
    receipt.deleteItem(name);
  }
}

describe("total() - subtotal without tax", () => {
  test("[Happy path] sums the four initial items", () => {
    expect(receipt.total()).toBe(47.49);
  });

  test("[Happy path] repeated calls do not change the subtotal", () => {
    expect(receipt.total()).toBe(47.49);
    expect(receipt.total()).toBe(47.49);
  });

  test("[Edge case] an empty list has a zero subtotal", () => {
    emptyList();
    expect(receipt.total()).toBe(0);
  });

  test("[Edge case] decimal prices are added in cents", () => {
    emptyList();
    receipt.addItem("first item", 0.1);
    receipt.addItem("second item", 0.2);
    expect(receipt.total()).toBe(0.3);
  });
});

describe("addItem()", () => {
  test("[Happy path] adds a valid product", () => {
    receipt.addItem("milk", 3.5);
    expect(receipt.total()).toBe(50.99);
    const items = receipt.deleteItem("not in the list");
    expect(items).toContainEqual({ name: "milk", price: 3.5 });
  });

  test("[Happy path] trims surrounding whitespace in a name", () => {
    receipt.addItem("  apples  ", 2);
    expect(receipt.deleteItem("not in the list")).toContainEqual({
      name: "apples", price: 2,
    });
  });

  test("[Edge case] allows a zero-price item", () => {
    receipt.addItem("free sample", 0);
    expect(receipt.total()).toBe(47.49);
    expect(receipt.deleteItem("not in the list")).toContainEqual({
      name: "free sample", price: 0,
    });
  });

  test("[Edge case] rounds an incoming price to the nearest cent", () => {
    emptyList();
    receipt.addItem("sample", 1.005);
    expect(receipt.total()).toBe(1.01);
  });

  test.each(["", "   "])("[Unhappy path] rejects blank name %j", (name) => {
    expect(() => receipt.addItem(name, 2)).toThrow(TypeError);
    expect(receipt.total()).toBe(47.49);
  });

  test("[Unhappy path] rejects a non-string name at runtime", () => {
    expect(() => receipt.addItem(null as unknown as string, 2)).toThrow(TypeError);
    expect(receipt.total()).toBe(47.49);
  });

  test.each([-1, Number.NaN, Infinity, -Infinity])(
    "[Unhappy path] rejects invalid price %s without mutating the list",
    (price) => {
      expect(() => receipt.addItem("invalid item", price)).toThrow(RangeError);
      expect(receipt.total()).toBe(47.49);
    },
  );

  test("[Unhappy path] rejects a string price at runtime", () => {
    expect(() => receipt.addItem("invalid item", "2" as unknown as number))
      .toThrow(RangeError);
    expect(receipt.total()).toBe(47.49);
  });

  test("[Edge case] rejects amounts beyond safe cent precision", () => {
    expect(() => receipt.addItem("too large", Number.MAX_VALUE)).toThrow(RangeError);
    expect(receipt.total()).toBe(47.49);
  });
});

describe("deleteItem()", () => {
  test("[Happy path] deletes the requested middle item, not the last item", () => {
    const remaining = receipt.deleteItem("eggs");
    expect(remaining.map((item) => item.name)).toEqual([
      "paper towels", "sandwich", "avocado oil",
    ]);
    expect(receipt.total()).toBe(40.74);
  });

  test("[Happy path] deletes the first item", () => {
    const remaining = receipt.deleteItem("paper towels");
    expect(remaining).toHaveLength(3);
    expect(receipt.total()).toBe(25.5);
  });

  test("[Happy path] deletes the last item", () => {
    const remaining = receipt.deleteItem("avocado oil");
    expect(remaining).toHaveLength(3);
    expect(receipt.total()).toBe(37.49);
  });

  test("[Unhappy path] an unknown name does not remove another product", () => {
    const remaining = receipt.deleteItem("not in the list");
    expect(remaining).toHaveLength(4);
    expect(receipt.total()).toBe(47.49);
  });

  test("[Unhappy path] rejects a blank name without changing the list", () => {
    expect(() => receipt.deleteItem("   ")).toThrow(TypeError);
    expect(receipt.total()).toBe(47.49);
  });

  test("[Edge case] deleting from an empty list returns an empty list", () => {
    emptyList();
    expect(receipt.deleteItem("eggs")).toEqual([]);
    expect(receipt.total()).toBe(0);
  });

  test("[Edge case] deletes only the first duplicate name", () => {
    receipt.addItem("eggs", 1);
    const remaining = receipt.deleteItem("eggs");
    expect(remaining.filter((item) => item.name === "eggs"))
      .toEqual([{ name: "eggs", price: 1 }]);
    expect(receipt.total()).toBe(41.74);
  });

  test("[Edge case] the returned snapshot cannot mutate internal items", () => {
    const snapshot = receipt.deleteItem("not in the list");
    snapshot[0].price = 0;
    snapshot.pop();
    expect(receipt.total()).toBe(47.49);
  });
});

describe("tax() - grand total including tax", () => {
  test("[Happy path] applies a 10% tax rate", () => {
    expect(receipt.tax(0.1)).toBe(52.24);
    expect(receipt.total()).toBe(47.49);
  });

  test("[Edge case] a zero tax rate preserves the subtotal", () => {
    expect(receipt.tax(0)).toBe(47.49);
  });

  test("[Edge case] a 100% tax rate doubles the subtotal", () => {
    expect(receipt.tax(1)).toBe(94.98);
  });

  test("[Edge case] the grand total of an empty list is zero", () => {
    emptyList();
    expect(receipt.tax(0.1)).toBe(0);
  });

  test("[Edge case] rounds a half-cent tax upward", () => {
    emptyList();
    receipt.addItem("sample", 0.05);
    expect(receipt.tax(0.1)).toBe(0.06);
  });

  test.each([-0.01, 1.01, Number.NaN, Infinity, -Infinity])(
    "[Unhappy path] rejects invalid tax rate %s",
    (rate) => {
      expect(() => receipt.tax(rate)).toThrow(RangeError);
    },
  );

  test("[Unhappy path] rejects a string tax rate at runtime", () => {
    expect(() => receipt.tax("0.1" as unknown as number)).toThrow(RangeError);
  });
});

describe("printReceipt()", () => {
  test("[Happy path] prints every item and all correct monetary amounts", () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => undefined);
    receipt.printReceipt(0.1);
    expect(log.mock.calls.map((call) => call[0])).toEqual([
      "************************",
      "paper towels : $21.99",
      "sandwich : $8.75",
      "eggs : $6.75",
      "avocado oil : $10.00",
      "************************",
      "Subtotal: $47.49",
      "Tax: $4.75",
      "Total: $52.24",
    ]);
  });

  test("[Happy path] reflects products added and deleted before printing", () => {
    receipt.deleteItem("sandwich");
    receipt.addItem("milk", 3.5);
    const log = jest.spyOn(console, "log").mockImplementation(() => undefined);
    receipt.printReceipt(0.1);
    expect(log).toHaveBeenCalledWith("milk : $3.50");
    expect(log).not.toHaveBeenCalledWith("sandwich : $8.75");
    expect(log).toHaveBeenCalledWith("Subtotal: $42.24");
    expect(log).toHaveBeenCalledWith("Tax: $4.22");
    expect(log).toHaveBeenCalledWith("Total: $46.46");
  });

  test("[Edge case] prints a zero-value receipt for an empty list", () => {
    emptyList();
    const log = jest.spyOn(console, "log").mockImplementation(() => undefined);
    receipt.printReceipt(0.1);
    expect(log.mock.calls.map((call) => call[0])).toEqual([
      "************************", "************************",
      "Subtotal: $0.00", "Tax: $0.00", "Total: $0.00",
    ]);
  });

  test("[Unhappy path] rejects an invalid tax rate before printing", () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => undefined);
    expect(() => receipt.printReceipt(-0.1)).toThrow(RangeError);
    expect(log).not.toHaveBeenCalled();
  });
});
