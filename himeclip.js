'use strcit';

const axios = require('axios');
const fs = require('fs'); //注: npm i 不要
const qs = require('querystring');

//データ更新関数
async function updateData(newData){
    const PATH = './docs/data.json';
    fs.writeFileSync(PATH, JSON.stringify(newData));
}


//検索用の日付キー作成
function search_date_key(set_date,set_month,set_year){
  var monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return set_date + ' ' + monthShortNames[set_month] + ' ' + set_year
}


//LINE
const LINE_NOTIFY_API_URL = 'https://notify-api.line.me/api/notify';
const LINE_NOTIFY_TOKEN = process.env.LINE_TOKEN;

let config = {
    url: LINE_NOTIFY_API_URL,
    method: 'post',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + LINE_NOTIFY_TOKEN
    },
    data: qs.stringify({
        message: 'ProtoOut Studioからの通知だよー！',
    })
}


// 実際にデータを取得する getRequest 関数
async function getRequest(today) {
  
  let response;


  let set_year = today.getFullYear();
  let set_date = today.getDate();
  let set_month = today.getMonth();

  let set_week_str = [ "日", "月", "火", "水", "木", "金", "土" ][today.getDay()] ;	// 曜日(日本語表記)


  date_key = search_date_key(set_date,set_month,set_year)

  try {
    response = await axios.get('https://www.nhk.or.jp/school/himeclip/xml/' + set_year + ('00'+ (set_month +1)).slice(-2) + '.xml')
    let xml = response.data;

    //xml = xml.getElementsByTagName('item');
    xml = xml.replace(/\r?\n/g,""); //整形1: 改行などを削除して整形しやすくする
    xml = xml.replace(/    /g,""); //整形1: 改行などを削除して整形しやすくする
    let items = xml.match(/(<item>.*?<\/item>)/g);

    regexp = new RegExp(', ' + date_key,'g')
    //console.log(regexp)
    const result = items.filter(item => item.match(regexp));
    let res = result[0]

    //console.log(res)
    //onthisday
    let onthisday_value = res.match(/<onthisday><!\[CDATA\[(.*?)\]\]><\/onthisday>/)[1]
    console.log("onthisday_valu::" + onthisday_value)
    
    //description
    let description_value = res.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)[1]
    description_value = description_value.replace(/<\/rb>(.*?)<\/ruby>/g,'');
    description_value = description_value.replace(/<ruby><rb>/g,'');
    console.log("description_value::" + description_value)
 
    //link
    let link_value = res.match(/<link>(.*?)<\/link>/)[1]
    link_value = "https://www2.nhk.or.jp/school/" + link_value
    console.log("link_value:::" + link_value)

    //image
    let image_value = res.match(/<image>(.*?)<\/image>/)[1]
    image_value = "https:" + image_value
    console.log("image_value::" + image_value)



    //ファイル作成
    await updateData({ "onthisday_valu": onthisday_value,"description_value":description_value,"link_value":link_value, "image_value":image_value }); //データ更新関数を実行


    // メッセージ構成
    // 文字列を+=で連結していく。
    // ダブルクオーテーションで囲むと "\n" で改行も加えられる特性がある。
    let messageText = "\n";
    messageText += "おはようございます(smile)！\n "
    messageText +=  (set_month+1) + "月" + set_date + "日" + set_week_str + "曜日"
    messageText += "の「日めクリップ」です。\n\n"
    messageText += "きょうの出来事\n「"+ onthisday_value +"」\n\n" ;
    messageText += description_value + "\n\n" ;
    messageText +=  link_value;

    // config のメッセージを送る部分 config.data を上書き
    config.data =  qs.stringify({
      imageFullsize:image_value,
      imageThumbnail: image_value,
      message: messageText
    });

    ////// LINE Notify に送る ////////////////////////
    try {
      const responseLINENotify = await axios.request(config);
      console.log(responseLINENotify.data);
    } catch (error) {
      console.error(error);
    }



  } catch (error) {
    console.error(error);
  }
}


//今日の日付取得
var today = new Date();

// getRequest を呼び出してデータを読み込む
getRequest(today);



