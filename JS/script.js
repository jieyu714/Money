import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://mdspsmxwitbczvfwzpiu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kc3BzbXh3aXRiY3p2Znd6cGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMjMwNDUsImV4cCI6MjA2Mjg5OTA0NX0.2sb9ReFc7T2sqjcTGrzPK_til3XcZVNBgcb4UzGegM4'
const supabase = createClient(supabaseUrl, supabaseKey)

let userData, userError;

async function importData(group) {

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
        
        let sum = 0;

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
            
            sum += parseInt(userData[i].amount) * (userData[i].buyOrSell.toLowerCase() == "buy" ? -1 : 1);
        }

        let tmp = `<tr>
                        <td></td>
                        <td>total</td>
                        <td>${(sum == 0 ? '' : (sum > 0 ? "Get" : "Pay"))}</td>
                        <td></td>
                        <td></td>
                        <td>${Math.abs(sum)}</td>
                    </tr>`; 

        htmlContent += tmp;

        tableBody.innerHTML = htmlContent;
    } else {
        tableHead.innerHTML = '';
        tableBody.innerHTML = "<div>查無此人紀錄</div>";
        return
    }
}

document.addEventListener('DOMContentLoaded', () => {
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
});
