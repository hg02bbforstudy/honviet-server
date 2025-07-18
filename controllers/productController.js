exports.getAllProducts = (req, res) => {
  const mockProducts = [
    { id: 1, name: 'Board Game A', price: 200000 },
    { id: 2, name: 'Board Game B', price: 320000 },
  ];
  res.json(mockProducts);
};
