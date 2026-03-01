const router = require ("express").Router();
const  productsController =  require("../controllers/products.controller");

router.get("/", productsController.list);
router.get("/:id", productsController.getById);
router.post("/", productsController.create);
 router.put("/:id", productsController.update);
router.delete("/:id",  productsController.remove);

module.exports = router ;