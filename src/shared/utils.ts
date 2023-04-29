// import SHA256 from 'crypto-js/sha256';

// /** 生成 hash */
// export const createHash = (len: number) => {
//   const TimeStamp = `${Date.now()}${Math.random()}`;
//   const hash = SHA256(TimeStamp).toString().substring(0, len); // 输出前 16 个字符作为 hash 值
//   return hash;
// };

export function createHash(len: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
  let temp = [...characters];
  let str = '';
  for (let i = 0; i < len; i++) {
    let remain = temp.length;
    if(remain === 0) {
      temp = [...characters];
      remain = temp.length;
    }
    const charI = Math.floor(Math.random() * remain);
    const [char] =  temp.splice(charI, 1);
    str += char;
  }
  return str;
}

export const isObjectLike = (v: any) => Object.prototype.toString.call(v).match(/\[object (Array|Object)\]/);
export const last = (arr: any[]) => arr[arr.length - 1];

// console.log(createHash(20));
 