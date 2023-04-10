const div = documentDCreateElement('div');
const a = {
  ____sandboxHash: () => 1,
}
console.log(JSON.stringify(a)); 
const hash = a.____sandboxHash();
console.log(hash);
function documentDCreateElement(...args){var el=document.createElement(...args);el.setAttribute('sandbox_cb5c0edb');return el;}