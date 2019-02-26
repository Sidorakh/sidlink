const express = require('express');
const body_parser = require('body-parser');
const fs = require('fs');
const app = express();
app.use(body_parser.urlencoded({extended:false}));
app.use(body_parser.json());
let link_map = {};
if (fs.existsSync('./link_map.json')) {
    let json = fs.readFileSync('./link_map.json');
    link_map = JSON.parse(json);
}

app.get('/', async (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});
app.get('/index.html', async (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});
app.get('/admin', async (req, res) => {
    res.sendFile(`${__dirname}/admin.html`);
});
app.get('/admin.html', async (req, res) => {
    res.sendFile(`${__dirname}/admin.html`);
});
app.get('/signout', async (req, res) => {
    res.sendFile(`${__dirname}/signout.html`);
});
app.get('/signout.html', async (req, res) => {
    res.sendFile(`${__dirname}/signout.html`);
});
app.get('/assets/:name', async (req, res) => {
    let file = `${__dirname}/assets/${req.params.name}`;
    res.contentType(req.params.name);
    fs.readFile(file,(err,data)=>{
        if (err) throw err;
        res.send(data);
    })
    //res.sendFile(`${__dirname}/assets/${req.param.name}`);
});

app.get('/:page',async (req, res) => {
    console.log(req.params.page);
    if (link_map[req.params.page] != undefined) {
        res.redirect(link_map[req.params.page]);
    } else {
        res.send('404 - you used an invalid link!');
    }
});

app.post('/create', async (req, res) => {
    let link_id = req.body.link_name;
    
    if (link_id==undefined || link_id == "") {
        console.log('No key provided - generating a key');
        let taken = true;
        while (taken == true) {
            uid = "xxxxx".replace(/x/g,function (c) {
                return (Math.floor(Math.random()*36)).toString(36);
            });
            if (link_map[uid] == undefined) {
                link_id = uid;
                taken = false;
            }
        }
    } else {
        console.log(`Key provided - checking ${link_id}`)
        if (link_map[link_id] != undefined) {
            res.send(JSON.stringify({
                type:'error',
                message:'Specified link id already exists',
                key:link_id
            }))
            console.log(`${link_id} is unavailable`)
            return;
        }
        console.log(`${link_id} is available`);
    }
    console.log(`link_url: ${req.body.link_url}`);
    link_map[link_id] = req.body.link_url;
    fs.writeFile('./link_map.json',JSON.stringify(link_map,null,4), (err)=>{
        if(err) {
            console.error(err);
        }
    });
    res.redirect('/admin.html');
});

app.post('/get-links',async (req, res) =>{
    res.send(JSON.stringify(link_map));
});

app.delete('/delete-link/:link', async (req, res) => {
    link_map[req.params.link] = undefined;
    let str = JSON.stringify(link_map,null,4);
    fs.writeFile('./link_map.json',str, (err)=>{
        if(err) {
            console.error(err);
        }
    })
    link_map = JSON.parse(str);
    res.send(`Deleted link ${req.params.link}`);
});

app.listen(3000);

