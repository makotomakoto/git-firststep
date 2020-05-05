const axios = require('axios');
const qs = require('querystring');

const LINE_NOTIFY_API_URL = 'https://notify-api.line.me/api/notify';

//const LINE_NOTIFY_TOKEN = 'LINE_NOTIFY_TOKEN';
const LINE_NOTIFY_TOKEN = process.env.LINE_TOKEN;


let config = {
    url: LINE_NOTIFY_API_URL,
    method: 'post',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + LINE_NOTIFY_TOKEN
    },
    data: qs.stringify({
      imageFullsize: `https://images.dog.ceo/breeds/airedale/n02096051_3443.jpg`,
      imageThumbnail: `https://images.dog.ceo/breeds/airedale/n02096051_3443.jpg`,
      message: 'ProtoOut Studioからの通知だよー！ https://images.dog.ceo/breeds/airedale/n02096051_3443.jpg',
    })
}

async function getRequest() {

  ////// 天気情報APIを最初につなげる //////////////////

  let responseWeather;

  try {
    //退屈と戦うためにランダムな活動を見つける
    response = await axios.get(`https://random.dog/woof.json`);


    // console.log(responseWeather.data);
  } catch (error) {
    console.error(error);
  }
  // メッセージ構成
  // 文字列を+=で連結していく。
  // ダブルクオーテーションで囲むと "\n" で改行も加えられる特性がある。
  let messageText = "\n";
  messageText += response.data.url;
  // config のメッセージを送る部分 config.data を上書き
  //config.data =  qs.stringify({
  //  message: messageText,
  //});

  ////// LINE Notify に送る ////////////////////////

  try {
    const responseLINENotify = await axios.request(config);
    console.log(responseLINENotify.data);
  } catch (error) {
    console.error(error);
  }

}

// getRequest を呼び出してデータを読み込む
getRequest();