import SHA256 from 'crypto-js/sha256';

/** 生成 hash */
export const createHash = (len: number) => {
  const TimeStamp = `${Date.now()}${Math.random()}`;
  const hash = SHA256(TimeStamp).toString().substring(0, len); // 输出前 16 个字符作为 hash 值
  return hash;
};
