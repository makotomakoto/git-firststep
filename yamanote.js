'use strcit';

const axios = require('axios');
const fs = require('fs'); //注: npm i 不要

//データ更新関数
async function updateData(newData){
    const PATH = './docs/data.json';
    fs.writeFileSync(PATH, JSON.stringify(newData));
}

// 実際にデータを取得する getRequest 関数
async function getRequest() {
  let response;
  try {
    response = await axios.get('https://transit.yahoo.co.jp/traininfo/detail/21/0/');
    let html = response.data;
    html = html.replace(/\r?\n/g,""); //整形1: 改行などを削除して整形しやすくする
    let unko = html.match(/id="mdServiceStatus">(.*?)<\/div>/)[1];
    unko = unko.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,''); //整形2: タグを削除
    console.log(unko);

    await updateData({msg: unko}); //データ更新関数を実行

  } catch (error) {
    console.error(error);
  }
}

// getRequest を呼び出してデータを読み込む
getRequest();