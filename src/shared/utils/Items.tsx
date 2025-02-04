class Item {
  id: number;
  type_name: string;
  type_code: string;
  serial_code: string;
  barcode: string;
  status: string;

  constructor(id: number, type_name: string, type_code: string, serial_code: string, barcode: string, status: string = "available") {
    this.id = id;
    this.type_name = type_name;
    this.type_code = type_code;
    this.serial_code = serial_code;
    this.barcode = barcode;
    this.status = status;
  }

  /**
   * Serialize the Item instance into a plain object for sending to the backend.
   */
  toJSON(): object {
    return {
      id: this.id,
      type_name: this.type_name,
      type_code: this.type_code,
      serial_code: this.serial_code,
      barcode: this.barcode,
      status: this.status,
    };
  }

  /**
   * Provide a descriptive representation of the Item (useful for debugging/logging).
   */
  describe(): string {
    return `Item Id: ${this.id} , Item: ${this.type_name} (${this.type_code}), Serial: ${this.serial_code}, Barcode: ${this.barcode}`;
  }
}

export default Item;
