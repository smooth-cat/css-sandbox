const div = documentDCreateElement('div');
const a = {
  ____sandboxHash: () => 1,
}
console.log(JSON.stringify(a)); 
const hash =   ____sandboxHash();
console.log(hash);
function documentDCreateElement(...args){var el=document.createElement(...args);el.setAttribute('sandbox_006b713b');return el;}
function ____sandboxHash(){return 'sandbox_006b713b';}