'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');

var Article = require('../models/article');
var article = require('../models/article');
const { exists } = require('../models/article');
const { errorMonitor } = require('events');


var controller = {

    datosCurso: (req, res) => {
        var hola = req.body.hola;
    
        return res.status(200).send({
            curso: 'Master en Frameworks JS',
            autor: 'Victor Robles WEB',
            url: 'victorrobles.web',
            hola
        });
    },

    test: (req, res) => {
        return res.status(200).send({
            message: 'Soy la accion test de mi controlador de articulos'
        });
    },

    save: (req, res) => {
        // Recoger parametros por Post
        var params = req.body;
        console.log(params);

        // Validar datos (validator)
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);

        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            });
        }

        if(validate_title && validate_content){
            // Crear el objeto a guardad
            var article = new Article();

            // Asignar valor 
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
                message: 'Los datos no son validos'
            });
        }
        
    },

    getArticles: (req, res) => {

        var query = Article.find({});

        var last = req.params.last;
        if(last || last != undefined){
            query.limit(5);
        }

        //find

        query.sort('-_id').exec((err, articles) => {

            if(err){
                return res.status(500).send({
                    status: 'success',
                    message: 'Error al devolver los articulos !!!'   
                });
            }

            if(!articles){
                return res.status(404).send({
                    status: 'success',
                    message: 'No hay articulos para entrar !!!'   
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

        // COmprobar que existe 
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
                    message: 'No existe el articulo !!!'
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
                        message: 'Error al actualizar  !!!'
                    });
                }

                if(!articleUpdated){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe elarticulo !!!'
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
                message: 'La validacion noes correcta  !!!'
            });
        }

    },

    delete: (req, res) => {
        // Recoger el id de la url
        var articleId = req.params.id;

        //Find and delete
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

    uploadImage: (req, res) => {
        /*
        // Configurar el modulo connect multiparty router/article.js
        
        // Recoger el fichero de la particion 
        var file_name = 'Imagen no subida...';
        
        if(!req.files.file0){
            return res.status(404).send({
                status: 'error',
                message: 'No ha cargado ningun fichero',
            });
        }

        console.log(req.files);

        // Conseguir nombre y la extension del archivo
        
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');

        // * Advertencia LINUX/MAC*
        //var file_split = file_path.split('/');

        // Nombre del archivo
        var file_name = file_split[2];

        // Extension del fichero
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];

        // Comprobar la extension, solo imagenes, si es valida borrar el fichero
        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
            // Borrar el archivo subido
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'error',
                    message: 'La extensión de la imagen no es válida !!!'
                });
            });
        }else{
            // Si todo es valido, sacando id de la url
            var articleId = req.params.id;
            
            // Buscar el articulo, asignarle el nombre de la imagen y actualizarlo
            Article.findOneAndUpdate({_id: articleId}, {image: file_name}, {new:true}, (err, articleUpdated) => {
                
                if(err || !articleUpdated){
                    return res.status(200).send({
                        status:'error',
                        message: 'Error al guardar la imagen de articulo'
                    });
                }

                return res.status(200).send({
                    status:'success',
                    article: articleUpdated
                });
            });

        }
        */

    /*
        // 2 METODO MODIFICADO

        // Configurar el modulo connect multiparty router/article.js
        
        // Recoger el fichero de la particion 
        if(req.file){
            var file_path = req.file.path;
            var file_split = file_path.split('\\');
            var file_name = file_split[2];
            var ext_split = req.file.orinalname.split('\.');
            var file_ext = ext_split[1];

            if(file_ext == 'png' || file_ext == 'gif' || file_ext == 'jpg' || file_ext == 'jpeg'){

            }

        }
    */



/*
        console.log(req.file);

        // Conseguir nombre y la extension del archivo
        
        var file_path = req.file.path;
        var file_split = file_path.split('\\');

        // * Advertencia LINUX/MAC*
        //var file_split = file_path.split('/');

        // Nombre del archivo
        var file_name = file_split[2];

        // Extension del fichero
        var ext_split = file_name.split('\.');
        var file_ext = extension_split[1];

        // Comprobar la extension, solo imagenes, si es valida borrar el fichero
        if(file_ext == 'png' && file_ext == 'jpg' && file_ext == 'jpeg'){
            // Borrar el archivo subido
        }else{
            // Si todo es valido

            // Buscar el articulo, asignarle el nombre de la imagen y actualizarlo
        }

        return res.status(404).send({
            fichero: req.file,
            split: file_split,
            file_ext
        });
        
*/


    var articleId = req.params.id;
       if(req.file){

        // console.log(req.file);
    
        var file_path = req.file.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
    
        var ext_split = req.file.originalname.split('\.');
        var file_ext = ext_split[1];
    
        if(file_ext== 'png' || file_ext== 'gif' || file_ext== 'jpg' || file_ext== 'jpeg'){
    
          Article.findByIdAndUpdate(articleId, {image:file_name}, (err, articleUpdated) => {
    
            if(!articleUpdated){
    
              res.status(404).send({message: 'No se ha podido actualizar el album'});
    
            }else{
    
              res.status(200).send({article: articleUpdated});
    
            }
    
          })
    
        }else{
    
          res.status(200).send({message: 'Extension del archivo no valida'});
    
        }
    
      }else{
    
        res.status(200).send({image: file_name});
    
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

        
    },



}; // end controller

module.exports = controller;