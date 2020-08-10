'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');

var Article = require('../models/article');

var controller = {

    datosCurso: (req, res) => {
        var hola = req.body.hola;
    
        return res.status(200).send({
            curso: 'Master en Frameworks JS',
            autor: 'Víctor Robles WEB',
            url: 'victorroblesweb.es',
            hola
        });
    },

    test: (req, res) => {
        return res.status(200).send({
            message: 'Soy la acción test de mi controlador de articulos'
        });
    },

    save: (req, res) => {
        // Recoger parametros por post
        var params = req.body;

        // Validar datos (validator)
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);

        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar !!!'
            });
        }

        if(validate_title && validate_content){
            
            //Crear el objeto a guardar
            var article = new Article();

            // Asignar valores
            article.title = params.title;
            article.content = params.content;

            if(params.image){
                article.image = params.image;
            }else{
                article.image = null;
            }
           
            // Guardar el articulo
            article.save((err, articleStored) => {

                if(err || !articleStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El articulo no se ha guardado !!!'
                    });
                }

                // Devolver una respuesta 
                return res.status(200).send({
                    status: 'success',
                    article: articleStored
                });

            });

        }else{
            return res.status(200).send({
                status: 'error',
                message: 'Los datos no son válidos !!!'
            });
        }
       
    },

    getArticles: (req, res) => {

        var query = Article.find({});

        var last = req.params.last;
        if(last || last != undefined){
            query.limit(5);
        }

        // Find
        query.sort('-_id').exec((err, articles) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los articulos !!!'
                });
            }

            if(!articles){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay articulos para mostrar !!!'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });

        });
    },

    getArticle: (req, res) => {

        // Recoger el id de la url
        var articleId = req.params.id;

        // Comprobar que existe
        if(!articleId || articleId == null){
            return res.status(404).send({
                status: 'error',
                message: 'No existe el articulo !!!'
            });
        }

        // Buscar el articulo
        Article.findById(articleId, (err, article) => {
            
            if(err || !article){
                return res.status(404).send({
                    status: 'error',
                    message: 'Error al devolver los datos !!!'
                });
            }

            // Devolverlo en json
            return res.status(200).send({
                status: 'success',
                article
            });

        });
    },

    update: (req, res) => {
        // Recoger el id del articulo por la url
        var articleId = req.params.id;

        // Recoger los datos que llegan por put
        var params = req.body;

        // Validar datos
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar !!!'
            }); 
        }

        if(validate_title && validate_content){
             // Find and update
             Article.findOneAndUpdate({_id: articleId}, params, {new:true}, (err, articleUpdated) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar !!!'
                    });
                }

                if(!articleUpdated){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el articulo !!!'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                });
             });
        }else{
             // Devolver respuesta
            return res.status(200).send({
                status: 'error',
                message: 'La validación no es correcta !!!'
            });
        }
       
    },

    delete: (req, res) => {
        // Recoger el id de la url
        var articleId = req.params.id;

        // Find and delete
        Article.findOneAndDelete({_id: articleId}, (err, articleRemoved) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar !!!'
                });
            }

            if(!articleRemoved){
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado el articulo, posiblemente no exista !!!'
                });
            }

            return res.status(200).send({
                status: 'success',
                article: articleRemoved
            });

        }); 
    },

    upload: (req, res) => {

       if(req.file){

        // console.log(req.file);
        // Conseguir nombre y extension del archivo
        var file_path = req.file.path;
        var file_split = file_path.split('\\');
       
        // Nombre del archivo
        var file_name = file_split[2];
    
        // Extensión del fichero
        var ext_split = req.file.originalname.split('\.');
        var file_ext = ext_split[1];
    
            //Comprobar la extension solo imagenes
            if(file_ext == 'png' || file_ext == 'gif' || file_ext == 'jpg' || file_ext == 'jpeg'){
            
                var articleId = req.params.id;
                if(articleId){
                    
                    //Buscar el artticulo, asignarle el nombre de la imagen y actualizarlo
                    Article.findByIdAndUpdate({_id: articleId}, {image:file_name}, {new:true}, (err, articleUpdated) => {
        


                        if(err || !articleUpdated){
                
                        res.status(404).send({message: 'No se ha podido actualizar el album'});
                
                        }else{
                        /* Console log para identificar parametros 
                        console.log(req.file);
                        console.log(file_split);
                        console.log(file_name);
                        console.log(file_ext);
                        console.log(articleId);
                        */
                        console.log(file_name);
                        res.status(200).send({article: articleUpdated});
                
                        }
                
                        });
                }else{
                    console.log(file_name);
                    res.status(200).send({image: file_name});
                }
            }else{
            fs.unlink(file_path, (err) => {
                res.status(404).send({message: 'La Extension del archivo no valida'});
            });
        
            }
        }else{
    
        res.status(404).send({message: 'Extension del archivo no valida'});
      }
      
    }, // end upload file

    getImage: (req, res) => {
        var file = req.params.image;
        var path_file = './upload/articles/'+file;

        fs.exists(path_file, (exists) => {
            if(exists){
                return res.sendFile(path.resolve(path_file));
            }else{
                return res.status(404).send({
                    status: 'error',
                    message: 'La imagen no existe !!!'
                });
            }
        });
    },

    search: (req, res) => {
        // Sacar el string a buscar
        var searchString = req.params.search;

        // Find or
        Article.find({ "$or": [
            { "title": { "$regex": searchString, "$options": "i"}},
            { "content": { "$regex": searchString, "$options": "i"}}
        ]})
        .sort([['date', 'descending']])
        .exec((err, articles) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición !!!'
                });
            }
            
            if(!articles || articles.length <= 0){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay articulos que coincidan con tu busqueda !!!'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });

        });
    }

};  // end controller

module.exports = controller;