import React from "react";
import APIHandler from "../utils/APIHandler";
import AutoCompleteMedicine from "../components/AutoCompleteMedicine";

class BillGenerateComponent extends React.Component {
  constructor(props) {
    super(props);
    this.formSubmit = this.formSubmit.bind(this);
  }
  state = {
    errorRes: false,
    errorMessage: "",
    btnMessage: 0,
    sendData: false,
    medicineDetails: [
      {
        sr_no: 1,
        id: 0,
        medicine_name: "",
        qty: 1,
        qty_type: "Pieces",
        unit_price: 0,
        c_gst: 0,
        s_gst: 0,
        amount: 0,
      },
    ],
    currentSrno: 1,
  };

  async formSubmit(event) {
    event.preventDefault();

    const { medicineDetails } = this.state;
    const customer_name = event.target.customer_name.value;
    const address = event.target.address.value;
    const phone = event.target.phone.value;

    this.setState({ btnMessage: 1 });

    const apiHandler = new APIHandler();
    const response = await apiHandler.generateBill(
      customer_name,
      address,
      phone,
      medicineDetails
    );

    this.setState({
      btnMessage: 0,
      errorRes: response.data.error,
      errorMessage: response.data.message,
      sendData: true,
    });

    this.billGeneratePrint(customer_name, address, phone, medicineDetails);
  }

  billGeneratePrint(customer_name, address, phone, medicineDetails) {
    let billDetails =
      "<style> table{ width:100%;border-collapse:collapse; } td{ padding:5px } th { padding:5px } </style><div>";
    billDetails += "<table border='1'>";
    billDetails += "<tr><td colspan='7' style='text-align:center'>Bill For Customer</td></tr>";
    billDetails += `<tr><td colspan='2'>Name : ${customer_name}</td><td colspan='3'>Address : ${address}</td><td colspan='2'>Phone : ${phone}</td></tr>`;
    billDetails += "<tr><th>SR NO.</th><th>Name</th><th>QTY</th><th>QTY TYPE</th><th>UNIT PRICE</th><th>GST</th><th>AMOUNT</th></tr>";

    let totalamt = 0;
    medicineDetails.forEach((med) => {
      totalamt += parseInt(med.amount);
      billDetails += `<tr><td>${med.sr_no}</td><td>${med.medicine_name}</td><td>${med.qty}</td><td>${med.qty_type}</td><td>${med.unit_price}</td><td>${med.c_gst + med.s_gst}</td><td>${med.amount}</td></tr>`;
    });

    billDetails += `<tr><td colspan='6' style='text-align:right;font-weight:bold;background:green;color:white'>Total :</td><td>${totalamt}</td></tr>`;
    billDetails += "</table></div>";

    const mywindow = window.open("", "Bill Print", "height=650&width=900&top=100&left=100");
    mywindow.document.write(billDetails);
    mywindow.print();
  }

  AddMedicineDetails = () => {
    const srno = this.state.currentSrno + 1;
    const newItem = {
      sr_no: srno,
      medicine_name: "",
      qty: 1,
      qty_type: "Pieces",
      unit_price: 0,
      c_gst: 0,
      s_gst: 0,
      amount: 0,
    };
    this.setState((prevState) => ({
      currentSrno: srno,
      medicineDetails: [...prevState.medicineDetails, newItem],
    }));
  };

  RemoveMedicineDetails = () => {
    if (this.state.medicineDetails.length > 1) {
      this.setState((prevState) => ({
        currentSrno: prevState.currentSrno - 1,
        medicineDetails: prevState.medicineDetails.slice(0, -1),
      }));
    }
  };

  showDataInInputs = (index, item) => {
    const updatedDetails = [...this.state.medicineDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      id: item.id,
      qty: 1,
      qty_type: "Pieces",
      unit_price: item.sell_price,
      c_gst: item.c_gst,
      s_gst: item.s_gst,
      medicine_name: item.name,
      amount:
        (parseInt(item.sell_price) || 0) +
        (parseInt(item.c_gst) || 0) +
        (parseInt(item.s_gst) || 0),
    };
    this.setState({ medicineDetails: updatedDetails });
  };

  qtyChangeUpdate = (event) => {
    const value = parseInt(event.target.value) || 0;
    const index = event.target.dataset.index;
    const updatedDetails = [...this.state.medicineDetails];
    const med = updatedDetails[index];

    med.qty = value;
    med.amount =
      ((parseInt(med.unit_price) || 0) +
        (parseInt(med.c_gst) || 0) +
        (parseInt(med.s_gst) || 0)) * value;

    this.setState({ medicineDetails: updatedDetails });
  };

  render() {
    return (
      <section className="content">
        <div className="container-fluid">
          <div className="block-header">
            <h2>Generate Bill</h2>
          </div>
          <div className="card">
            <div className="header">
              <h2>Generate Bill for Customers</h2>
            </div>
            <div className="body">
              <form onSubmit={this.formSubmit}>
                <div className="row">
                  <div className="col-lg-6">
                    <label>Customer Name :</label>
                    <div className="form-group">
                      <input
                        type="text"
                        name="customer_name"
                        className="form-control"
                        placeholder="Enter Customer Name"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <label>Address :</label>
                    <div className="form-group">
                      <input
                        type="text"
                        name="address"
                        className="form-control"
                        placeholder="Enter Address"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <label>Phone :</label>
                    <div className="form-group">
                      <input
                        type="text"
                        name="phone"
                        className="form-control"
                        placeholder="Enter Phone"
                        required
                      />
                    </div>
                  </div>
                </div>

                <h4>Medicine Details</h4>
                {this.state.medicineDetails.map((item, index) => (
                  <div className="row" key={index}>
                    <div className="col-lg-2">
                      <label>SR No :</label>
                      <input
                        type="text"
                        className="form-control"
                        value={item.sr_no}
                        readOnly
                      />
                    </div>
                    <div className="col-lg-3">
                      <label>Medicine Name :</label>
                      <AutoCompleteMedicine
                        itemPostion={index}
                        showDataInInputs={this.showDataInInputs}
                      />
                    </div>
                    <div className="col-lg-2">
                      <label>Qty :</label>
                      <input
                        type="number"
                        className="form-control"
                        value={item.qty}
                        data-index={index}
                        onChange={this.qtyChangeUpdate}
                      />
                    </div>
                    <div className="col-lg-2">
                      <label>Qty Type :</label>
                      <input
                        type="text"
                        className="form-control"
                        value={item.qty_type}
                        readOnly
                      />
                    </div>
                    <div className="col-lg-3">
                      <label>Amount :</label>
                      <input
                        type="text"
                        className="form-control"
                        value={item.amount}
                        readOnly
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-info m-t-20"
                  onClick={this.AddMedicineDetails}
                >
                  + Add Medicine
                </button>
                <button
                  type="button"
                  className="btn btn-danger m-t-20 m-l-10"
                  onClick={this.RemoveMedicineDetails}
                >
                  - Remove Medicine
                </button>

                <br />
                <button type="submit" className="btn btn-primary m-t-20">
                  {this.state.btnMessage === 0 ? "Generate Bill" : "Please Wait..."}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default BillGenerateComponent;