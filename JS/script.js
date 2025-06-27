import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://mdspsmxwitbczvfwzpiu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kc3BzbXh3aXRiY3p2Znd6cGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMjMwNDUsImV4cCI6MjA2Mjg5OTA0NX0.2sb9ReFc7T2sqjcTGrzPK_til3XcZVNBgcb4UzGegM4'
const supabase = createClient(supabaseUrl, supabaseKey)

let userData, userError;

let userUUID = ''

function getNowTimeInformation() {
    return Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()).replace(/,/g, '');
}

function showLoading() {
    Swal.fire({
        title: '載入中...',
        html: '請稍候...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading()
        }
    });

    const clickableElements = document.querySelectorAll('button, .clickable-hours');
    clickableElements.forEach(element => {
        element.disabled = true;
    });
}

function hideLoading() {
    Swal.close();

    const clickableElements = document.querySelectorAll('button, .clickable-hours');
    clickableElements.forEach(element => {
        element.disabled = false;
    });
}

async function importData(group) {

    showLoading();

    const personName = document.getElementById('name').value;

    if (group == 'sell') {
        const { data, error } = await supabase
            .from("officeMoney")
            .select('*')
            .eq('buyOrSell', 'Sell')
            .order('date', { ascending: true });
        userData = data;
        userError = error;
    } else if (group == "buy") {
        const { data, error } = await supabase
            .from("officeMoney")
            .select('*')
            .eq('buyOrSell', 'Buy')
            .order('date', { ascending: true });
        userData = data;
        userError = error;
    } else if (group == "all") {
        const { data, error } = await supabase
            .from("officeMoney")
            .select('*')
            .order('date', { ascending: true });
        userData = data;
        userError = error;
    } else if (group == 'query') {
        const { data, error } = await supabase
            .from("officeMoney")
            .select('*')
            .eq('name', personName)
            .order('date', { ascending: true });
        userData = data;
        userError = error;
    }

    if (userError) {
        console.error('資料獲取錯誤:', userError);
        return;
    }

    showData();
}

async function showData() {
    const dataTable = document.getElementById("show");
    const tableHead = dataTable.querySelector("thead");
    const tableBody = dataTable.querySelector("tbody");
    let htmlContent = '';

    if (userData.length) {
        tableHead.innerHTML = "<tr><th>Name</th><th>Date</th><th>Buy or Sell</th><th>Store</th><th>Items</th><th>Amount</th></tr>";
        
        let sum1 = 0, sum2 = 0;

        for (let i = 0; i < userData.length; i++) {
            let isBold = userData[i].finish ? '<b>' : '';
            let boldEnd = userData[i].finish ? '</b>' : '';

            let tmp = `<tr>
                        <td>${isBold}${userData[i].name}${boldEnd}</td>
                        <td>${isBold}${userData[i].date}${boldEnd}</td>
                        <td>${isBold}${userData[i].buyOrSell}${boldEnd}</td>
                        <td>${isBold}${userData[i].store}${boldEnd}</td>
                        <td>${isBold}${userData[i].items}${boldEnd}</td>
                        <td>${isBold}${userData[i].amount}${boldEnd}</td>
                    </tr>`;

            htmlContent += tmp;
            
            sum1 += parseInt(userData[i].amount) * (userData[i].buyOrSell.toLowerCase() == "buy" ? -1 : 1);
            sum2 += parseInt(userData[i].amount) * (userData[i].buyOrSell.toLowerCase() == "buy" ? -1 : 1) * (!userData[i].finish);
        }

        let isBold = (sum2 == 0 ? '<b>' : '');
        let boldEnd = (sum2 == 0 ? '</b>' : '');

        let tmp = `<tr>
                        <td>${isBold}count${boldEnd}</td>
                        <td></td>
                        <td>${(sum2 == 0 ? '' : (sum2 > 0 ? "Get" : "Pay"))}</td>
                        <td></td>
                        <td></td>
                        <td>${isBold}${Math.abs(sum2)}${boldEnd}</td>
                    </tr>`; 

        htmlContent += tmp;

        tmp = `<tr>
                        <td>total</td>
                        <td></td>
                        <td>${(sum1 == 0 ? '' : (sum1 > 0 ? "Get" : "Pay"))}</td>
                        <td></td>
                        <td></td>
                        <td>${Math.abs(sum1)}</td>
                    </tr>`; 

        htmlContent += tmp;

        tableBody.innerHTML = htmlContent;
    } else {
        tableHead.innerHTML = '';
        tableBody.innerHTML = "<div>查無此人紀錄</div>";
        return
    }

    hideLoading();
}

async function loginWithEmail(email, password, remember) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('登入失敗：', error.message)
    return false
  }

  userUUID = data.user.id
  console.log('登入成功的UUID:', userUUID)

  if (remember) {
    localStorage.setItem('rememberedEmail', email)
    localStorage.setItem('rememberedUUID', userUUID) 
    localStorage.setItem('rememberedTime', Date.now())
  } else {
    localStorage.removeItem('rememberedEmail')
    localStorage.removeItem('rememberedUUID')
    localStorage.removeItem('rememberedTime')
  }

  return true
}

async function showLoginDialog() {
  while (true) {
    const { value: formValues } = await Swal.fire({
      title: '登入',
      html:
        `<input type="email" id="swal-email" class="swal2-input" placeholder="Email">` +
        `<input type="password" id="swal-password" class="swal2-input" placeholder="Password">` +
        `<label style="display: flex; align-items: center; justify-content: center; margin-top: 10px;">
           <input type="checkbox" id="swal-remember" style="margin-right: 8px;">
           記得我(5天)
         </label>`,
      focusConfirm: false,
      showCancelButton: false,
      confirmButtonText: '登入',
      allowOutsideClick: false,
      preConfirm: () => {
        const email = document.getElementById('swal-email').value.trim()
        const password = document.getElementById('swal-password').value.trim()
        const remember = document.getElementById('swal-remember').checked
        if (!email || !password) {
          Swal.showValidationMessage('請輸入 Email 和密碼')
          return false
        }
        return { email, password, remember }
      }
    })

    if (!formValues) {
      return null
    }

    const loginSuccess = await loginWithEmail(formValues.email, formValues.password, formValues.remember)
    if (loginSuccess) {
      return formValues.email
    } else {
      await Swal.fire({
        icon: 'error',
        title: '登入失敗',
        text: '帳號或密碼錯誤，請重新輸入',
        confirmButtonText: '再試一次'
      })
    }
  }
}

async function initialization() {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    const rememberedUUID = localStorage.getItem('rememberedUUID')
    const rememberedTime = localStorage.getItem('rememberedTime')

    const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000

    if (rememberedEmail && rememberedUUID && rememberedTime) {
        const timeDiff = Date.now() - Number(rememberedTime)
        if (timeDiff <= FIVE_DAYS_MS) {
        console.log(`使用記住的帳號自動登入: ${rememberedEmail}`)
        userUUID = rememberedUUID
        } else {
        localStorage.removeItem('rememberedEmail')
        localStorage.removeItem('rememberedUUID')
        localStorage.removeItem('rememberedTime')
        const email = await showLoginDialog()
        if (!email) {
            console.log('使用者未登入')
            return
        }
        }
    } else {
        const email = await showLoginDialog()
        if (!email) {
        console.log('使用者未登入')
        return
        }
    }

    document.getElementById("name").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            importData('query');
        }
    });
    document.getElementById("query").addEventListener("click", function() {
        importData('query');
    });
    document.getElementById("all").addEventListener("click", function() {
        importData('all');
    });
    document.getElementById("sell").addEventListener("click", function() {
        importData('sell');
    });
    document.getElementById("buy").addEventListener("click", function() {
        importData('buy');
    });
    document.getElementById("logout").addEventListener("click", logout);
    document.getElementById("update").addEventListener("click", update);
}

async function insertData(data) {
    console.log(data)
    try {
        const { data: myData, error: error1 } = await supabase
            .from('officeMoney')
            .insert([{ name: data.name, date: data.date, buyOrSell: data.buyOrSell, store: data.store, items: data.items, amount: data.amount, remark: data.remark }])
            .select('id')
            .single()
        if (error1) {
            console.error('Error inserting data:', error1);
            return
        } else {
            console.log(`office money 資料插入成功`);
        }

        const { error2 } = await supabase
            .from('officeMoneyInsertInformation')
            .insert([{ id: myData.id, timeInformation: getNowTimeInformation(), user_uuid: userUUID }])

        if (error2) {
            console.error('Error inserting data:', error2);
            return
        } else {
            console.log(`insert information 資料插入成功`);
            Swal.fire('新增成功!', '', 'success');
        }
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return
    }
}

async function update() {
    const today = new Date().toISOString().split('T')[0];

    Swal.fire({
        title: '新增',
        html: `
        <style>
            .swal-label {
            display: inline-block;
            width: 100px;
            text-align: right;
            margin-right: 10px;
            line-height: 30px;
            vertical-align: middle;
            }

            .swal-input {
            width: 200px;
            height: 30px;
            padding: 5px;
            box-sizing: border-box;
            font-size: 14px;
            border: 1px solid #ccc;
            outline: none;
            text-align: center;
            }

            #swal-input-buy-sell {
                cursor: pointer;
            }

            input[type="date"].swal-input {
            line-height: normal;
            }
        </style>

        <div style="text-align: left;">
            <label for="swal-input-name" class="swal-label">Name:</label>
            <input id="swal-input-name" class="swal2-input swal-input">
            <br>
        </div>

        <div style="text-align: left;">
            <label for="swal-input-date" class="swal-label">Date:</label>
            <input type="date" id="swal-input-date" class="swal2-input swal-input" value=${today}>
            <br>
        </div>

        <div style="text-align: left;">
            <label for="swal-input-buy-sell" class="swal-label">Buy or Sell:</label>
            <input type="text" id="swal-input-buy-sell" class="swal2-input swal-input" value="Buy" readonly>
            <br>
        </div>

        <div style="text-align: left;">
            <label for="swal-input-store" class="swal-label">Store:</label>
            <input id="swal-input-store" class="swal2-input swal-input">
            <br>
        </div>

        <div style="text-align: left;">
            <label for="swal-input-items" class="swal-label">Items:</label>
            <input id="swal-input-items" class="swal2-input swal-input">
            <br>
        </div>

        <div style="text-align: left;">
            <label for="swal-input-amount" class="swal-label">Amount:</label>
            <input type="number" id="swal-input-amount" class="swal2-input swal-input">
            <br>
        </div>

        <div style="text-align: left;">
            <label for="swal-input-remark" class="swal-label">Remark:</label>
            <input id="swal-input-remark" class="swal2-input swal-input">
            <br>
        </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: '確認',
        cancelButtonText: '取消',
        didOpen: () => {
            const buySellInput = document.getElementById('swal-input-buy-sell');

            buySellInput.addEventListener('mousedown', (event) => {
                event.preventDefault();
                buySellInput.value = buySellInput.value === 'Buy' ? 'Sell' : 'Buy';
            });
        },
        preConfirm: () => {
            if (!document.getElementById('swal-input-name').value) {
                swal.showValidationMessage('未輸入名字')
            } else if (!document.getElementById('swal-input-date').value) {
                swal.showValidationMessage('未選擇日期')
            } else if (!document.getElementById('swal-input-store').value) {
                swal.showValidationMessage('未輸入店名')
            } else if (!document.getElementById('swal-input-items').value) {
                swal.showValidationMessage('未輸入品名')
            } else if (!document.getElementById('swal-input-amount').value) {
                swal.showValidationMessage('未輸入價格')
            }
            return {
                name: document.getElementById('swal-input-name').value,
                date: document.getElementById('swal-input-date').value,
                buyOrSell: document.getElementById('swal-input-buy-sell').value,
                store: document.getElementById('swal-input-store').value,
                items: document.getElementById('swal-input-items').value,
                amount: document.getElementById('swal-input-amount').value,
                remark: document.getElementById('swal-input-remark').value
        }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const data = result.value;
            insertData(data)
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire('已取消!', '', 'error');
        }
    })
}

async function logout() {
  localStorage.removeItem('rememberedEmail')
  localStorage.removeItem('rememberedUUID')
  localStorage.removeItem('rememberedTime')

  await insertData('Logout')

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('登出錯誤:', error)
  } else {
    location.reload()
  }
}

document.addEventListener('DOMContentLoaded', () => {
    initialization()
});
