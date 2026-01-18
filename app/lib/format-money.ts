export default (n?: number) =>
    n === undefined ? "-" : `€${Number(n).toFixed(2)}`;