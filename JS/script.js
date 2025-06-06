import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://mdspsmxwitbczvfwzpiu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kc3BzbXh3aXRiY3p2Znd6cGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMjMwNDUsImV4cCI6MjA2Mjg5OTA0NX0.2sb9ReFc7T2sqjcTGrzPK_til3XcZVNBgcb4UzGegM4'
const supabase = createClient(supabaseUrl, supabaseKey)

async function importAndShowData() {

    const personName = document.getElementById('name').value;

    const { data, error } = await supabase
        .from("officeMoney")
        .select('*')
        .eq('name', personName);

    if (error) {
        console.error('資料獲取錯誤:', error);
        return;
    }
    
    
    const dataTable = document.getElementById("show");
    const tableHead = dataTable.querySelector("thead");
    const tableBody = dataTable.querySelector("tbody");
    let htmlContent = '';

    if (data.length) {
        tableHead.innerHTML = "<tr><th>Name</th><th>Date</th><th>Buy or Sell</th><th>Store</th><th>Items</th><th>Amount</th></tr>";
        
        let sum = 0;

        for (let i = 0; i < data.length; i++) {
            let tmp = `<tr>
                        <td>${data[i].name}</td>
                        <td>${data[i].date}</td>
                        <td>${data[i].buyOrSell}</td>
                        <td>${data[i].store}</td>
                        <td>${data[i].items}</td>
                        <td>${data[i].amount}</td>
                    </tr>`;
            
            htmlContent += tmp;
            
            sum += parseInt(data[i].amount) * (data[i].buyOrSell.toLowerCase() == "buy" ? -1 : 1);
        }

        let tmp = `<tr>
                        <td>${personName}</td>
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
    document.getElementById("query").addEventListener("click", importAndShowData);
});