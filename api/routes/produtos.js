// API REST dos produtos
import express from "express"
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const nomeCollection = 'produtos'
const { db, ObjectId } = await connectToDatabase()

/**********************************************
 * Validações
 * 
 **********************************************/
 const validaProduto = [
    check('codigo_produto')
    .not().isEmpty().trim().withMessage('É obrigatório informar o código do produto')
    .isNumeric().withMessage('O codigo do produto não pode conter caracteres especiais, apenas números')
    .isLength({ min: 1, max: 5 }).withMessage('O tamanho do codigo do produto informado é inválido.')
    .custom((value, { req }) => {
      return db.collection(nomeCollection).find({ codigo_produto: { $eq: value } }).toArray()
        .then((codigo_produto) => {
          if (codigo_produto.length && !req.body._id) {
            return Promise.reject(`O codigo do produto ${value} já está informado em outro produto`)
          }
        })
    }),
    check('nome_produto')
        .not().isEmpty().trim().withMessage('É obrigatório informar o nome do produto')
        .isAlphanumeric('pt-BR', { ignore: '/. ' }).withMessage('O nome do produto deve conter apenas caracteres alfanuméricos')
        .isLength({ min: 3 }).withMessage('O nome do produto é muito curto. Informe ao menos 3 caracteres')
        .isLength({ max: 100 }).withMessage('O nome do produto é muito longo. Informe no máximo até 100 caracteres'),
    check('valor_produto', 'O valor do produto só deve ser número')
    .isNumeric()
    .not().isEmpty().trim().withMessage('É obrigatório informar o nome do produto'),
    check('descricao_produto').optional({nullable: true}),
    check('categoria')
        .not().isEmpty().trim().withMessage('É obrigatório informar a categoria do produto')
        .isAlphanumeric('pt-BR', { ignore: '/. ' }).withMessage('A categoria do produto deve conter apenas caracteres alfanuméricos')
        .isLength({ min: 3 }).withMessage('A categoria do produto é muito curto. Informe ao menos 3 caracteres')
        .isLength({ max: 30 }).withMessage('A categoria do produto é muito longo. Informe no máximo até 30 caracteres'),
]


/**********************************************
 * GET /api/produtos
 **********************************************/
 router.get('/', async (req, res) => {
    /* 
     #swagger.tags = ['Produtos']
     #swagger.description = 'Endpoint para obter todos os Produtos do sistema.' 
     */
    try {
      db.collection(nomeCollection).find().sort({ nome_produto: 1 }).toArray((err, docs) => {
        if (!err) {
          /* 
          #swagger.responses[200] = { 
       schema: { "$ref": "#/definitions/Produtos" },
       description: "Listagem dos produtos obtid com sucesso" } 
       */
          res.status(200).json(docs)
        }
      })
    } catch (err) {
      /* 
         #swagger.responses[500] = { 
      schema: { "$ref": "#/definitions/Erro" },
      description: "Erro ao obter a listagem dos produtos" } 
      */
      res.status(500).json({
        errors: [
          {
            value: `${err.message}`,
            msg: 'Erro ao obter a listagem dos produtos do sistema',
            param: '/'
          }
        ]
      })
    }
  })

/**********************************************
 * GET /produtos/id/:id
 **********************************************/
router.get("/id/:id", async (req, res) => {
      /* #swagger.tags = ['Produtos']
      #swagger.description = 'Endpoint que retorna os dados do produto filtrando pelo id' 
      */
    try {
        db.collection(nomeCollection).find({ "_id": { $eq: ObjectId(req.params.id) } }).toArray((err, docs) => {
            if (err) {
                res.status(400).json(err) //bad request
            } else {
                res.status(200).json(docs) //retorna o documento
            }
        })
    } catch (err) {
        res.status(500).json({ "error": err.message })
    }
})

/**********************************************
 * GET /produtos/nome_produto/:nome_produto
 **********************************************/
router.get("/nome_produto/:nome_produto", async (req, res) => {
    /* #swagger.tags = ['Produtos']
      #swagger.description = 'Endpoint que retorna os dados do produto filtrando por parte do nome do produto' 
      */
    try {
        db.collection(nomeCollection).find({ nome_produto: { $regex: req.params.nome_produto, $options: "i" } }).toArray((err, docs) => {
            if (err) {
                res.status(400).json(err) //bad request
            } else {
                res.status(200).json(docs) //retorna o documento
            }
        })
    } catch (err) {
        res.status(500).json({ "error": err.message })
    }
})

/**********************************************
 * POST /produtos/
 **********************************************/
 router.post('/', validaProduto, async (req, res) => {
    /* #swagger.tags = ['Produtos']
      #swagger.description = 'Endpoint que inclui um novo produto' 
      */
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
            .insertOne(req.body)
            .then(result => res.status(201).send(result)) //retorna o ID do documento inserido)
            .catch(err => res.status(400).json(err))
    }
})

/**********************************************
 * PUT /produtos
 * Alterar um produto pelo ID
 **********************************************/
router.put('/', validaProduto, async (req, res) => {
  let idDocumento = req.body._id
  delete req.body._id //removendo o ID do body para o update não apresentar o erro 66
    /* #swagger.tags = ['Produtos']
      #swagger.description = 'Endpoint que permite alterar os dados dos produtos pelo id' 
      */
    const schemaErrors = validationResult(req)
    if (!schemaErrors.isEmpty()) {
        return res.status(403).json(({
            errors: schemaErrors.array() //retorna um Forbidden
        }))
    } else {
        await db.collection(nomeCollection)
            .updateOne({ '_id': { $eq: ObjectId(idDocumento) } },
                { $set: req.body }
            )
            .then(result => res.status(202).send(result))
            .catch(err => res.status(400).json(err))
    }
})

/**********************************************
 * DELETE /produtos/
 **********************************************/
router.delete('/:id', async (req, res) => {
    /* #swagger.tags = ['Produtos']
      #swagger.description = 'Endpoint que permite excluir um produto filtrando pelo id' 
      */
    await db.collection(nomeCollection)
        .deleteOne({ "_id": { $eq: ObjectId(req.params.id) } })
        .then(result => res.status(202).send(result))
        .catch(err => res.status(400).json(err))
})

export default router
