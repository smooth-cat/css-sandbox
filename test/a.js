const div = document.createElement('div');
const mockFn = () => {}
mockFn();
const a = {
  ____sandboxHash_____: () => 1,
}
console.log(JSON.stringify(a)); 
const hash = a.____sandboxHash_____();
console.log(hash);