import LPTokenABI from "../ABI/LPABI.json";
import { connection } from "../helper/connection";

export async function getBalanceof(method, LPaddress) {
  var get = await connection();

  try {
    if (get && get.web3) {
      var web3 = get.web3;
      var address = get.address;
      var Contract = new web3.eth.Contract(LPTokenABI, LPaddress);
      var result = await Contract.methods[method](address).call();

      return {
        value: result,
        status: true,
      };
    } else {
      return {
        value: "",
        status: false,
      };
    }
  } catch (err) {
    return {
      value: "",
      status: false,
    };
  }
}

export async function getnonces(method, LPaddress, useraddress) {
  var get = await connection();

  try {
    if (get && get.web3) {
      var web3 = get.web3;
      var Contract = new web3.eth.Contract(LPTokenABI, LPaddress);
      var result = await Contract.methods[method](useraddress).call();

      return {
        value: result,
        status: true,
      };
    } else {
      return {
        value: "",
        status: false,
      };
    }
  } catch (err) {
    return {
      value: "",
      status: false,
    };
  }
}

export async function getTokenaddress(method, LPaddress) {
  var get = await connection();

  try {
    if (get && get.web3) {
      var web3 = get.web3;
      var Contract = new web3.eth.Contract(LPTokenABI, LPaddress);
      var result = await Contract.methods[method]().call();

      return {
        value: result,
        status: true,
      };
    } else {
      return {
        value: "",
        status: false,
      };
    }
  } catch (err) {
    return {
      value: "",
      status: false,
    };
  }
}

export async function getTotalSupply(LPaddress) {
  var get = await connection();

  try {
    if (get && get.web3) {
      var web3 = get.web3;
      var Contract = new web3.eth.Contract(LPTokenABI, LPaddress);
      var result = await Contract.methods.totalSupply().call();

      return {
        value: result,
        status: true,
      };
    } else {
      return {
        value: "",
        status: false,
      };
    }
  } catch (err) {
    return {
      value: "",
      status: false,
    };
  }
}

export async function listenSwap(LPaddress) {
  var get = await connection();

  try {
    if (get && get.web3) {
      var web3 = get.web3;
      var Contract = new web3.eth.Contract(LPTokenABI, LPaddress);
      Contract.events.Swap(null, (error, event) => {


        return {
          error,
          event
        }
      })

      return {
        error: {},
        event: {}
      };
    } else {
      return {
        error: {},
        event: {}
      };
    }
  } catch (err) {
    return {
      error: {},
      event: {}
    };
  }
}
