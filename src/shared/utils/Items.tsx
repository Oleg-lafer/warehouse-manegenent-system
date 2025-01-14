class Item {
  type_name: string;
  type_code: string;
  serial_code: string;
  barcode: string;

  constructor(type_name: string, type_code: string, serial_code: string, barcode: string) {
    this.type_name = type_name;
    this.type_code = type_code;
    this.serial_code = serial_code;
    this.barcode = barcode;
  }

  /**
   * Create an Item instance from raw data returned by the backend.
   */
  static fromRawData(rawData: { type_name: string; type_code: string; serial_code: string }): Item {
    const { type_name, type_code, serial_code } = rawData;
    const barcode = `${type_code}${serial_code}`;
    return new Item(type_name, type_code, serial_code, barcode);
  }

  /**
   * Serialize the Item instance into a plain object for sending to the backend.
   */
  toJSON(): object {
    return {
      type_name: this.type_name,
      type_code: this.type_code,
      serial_code: this.serial_code,
      barcode: this.barcode,
    };
  }

  /**
   * Provide a descriptive representation of the Item (useful for debugging/logging).
   */
  describe(): string {
    return `Item: ${this.type_name} (${this.type_code}), Serial: ${this.serial_code}, Barcode: ${this.barcode}`;
  }
}

export default Item;
