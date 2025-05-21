module.exports = {
    getExample: (req, res) => {
        res.status(200).json({ message: "This is an example response" });
    },
    createExample: (req, res) => {
        const exampleData = req.body;
        // Logic to save exampleData to the database would go here
        res.status(201).json({ message: "Example created", data: exampleData });
    }
};