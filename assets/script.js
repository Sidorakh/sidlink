let page = window.location.href.split('/');
page = page[page.length-1];
let auth = firebase.auth();
auth.onAuthStateChanged(function(user) {
    console.log(page);
    if (user) {
        console.log('We have a user!');
        console.log(page);
        if (!page.includes('admin.html')) {
            window.location.href = 'admin.html';
        } else {
            retrieve_links();
        }
    } else {
        console.log('We have nothing!');
        if (page.includes('admin.html')) {
            window.location.href = 'index.html';
        }
    }
});

function login() {
    let btn_login = $('#login');
    btn_login.attr("disabled","disabled");
    let email = $('#email').val();
    let password = $('#password').val();
    auth.signInWithEmailAndPassword(email,password).catch(function(error) {
        console.error(error);
        btn_login.removeAttr("disabled");
    });
}

function signup() {
    var login_form = $('#signup');
    console.log(login_form);
    if(!login_form[0].checkValidity()) {
        return false;
    }
    let email = $('#email').val();
    let password = $('#password').val();
    sessionStorage.name = document.getElementById('name').value;
    auth.createUserWithEmailAndPassword(email,password).catch(function(error) {
        console.error(error);
    });
}

function reset_password(email) {
    auth.sendPasswordResetEmail(email).catch((e) => {
        console.error(e);
    });
    document.getElementById('sent').innerText = `If ${email} is registered in our systems, you will recieve a password reset email shortly. if you do not see it, please check spam`;
}

function return_false() {
    return false;
}

function logout() {
    auth.signOut().then(()=>{
        window.location.href="index.html";
    }).catch(()=>{
        window.location.href="index.html";        // redirect to login on error
    });
}

window.addEventListener("load",()=>{
    if (page.includes('signout.html')) {
        logout();
    }
});

function retrieve_links() {
    let xml = new XMLHttpRequest();
    xml.open('post','/get-links');
    xml.onload = ()=>{
        let link_map = JSON.parse(xml.responseText);
        display_links(link_map);
    };
    xml.send();
}

function display_links(link_map) {
    let base = window.location.hostname; 
    for (let key in link_map) {
        let url = `https://${base}/${key}`;
        let target = link_map[key];
        let chip_container = document.createElement('p');
        let chip = document.createElement('span');
        chip.className = 'mdl-chip';
        chip_container.id = `chip_${key}`
        let content = document.createElement('span');
        content.className = 'mdl-chip__text';
        content.innerHTML = `<a href="${url}">${url}</a> | <a href=${target}> ${target} </a>`;
        chip.appendChild(content);
        let btn_delete = document.createElement("button");
        btn_delete.onclick = () => {
            delete_link(key);
            $(`#chip_${key}`).remove();
        };
        btn_delete.className = 'mdl-chip__action';
        btn_delete.innerHTML = '<i class="material-icons">cancel</i>';
        chip.appendChild(btn_delete);
        componentHandler.upgradeElement(chip);
        chip_container.appendChild(chip);
        $("#chips").append(chip_container);
    }
}

function delete_link(link) {
    let xml = new XMLHttpRequest();
    xml.open('delete',`/delete-link/${link}`);
    xml.onload = () => {
        console.log(xml.responseText);
    }
    xml.send();
}