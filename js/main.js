// constant de la apikey ja que s'utilitza a totes les crides ajax
const APIKEY = '26c63516d3e8ed6b5a4f9224340b78dc';
// pàgina inicial de pelis/series
var page = 1;
// nombre màxim de pàgines de 20 pelis/series que hi ha
var maxPages;


// al carregar la pagina inicial 
$(function() {      
    // mostra les pelis mes populars
    getPelisPopulars();

    // quan es fa clic sobre una peli/serie es mostra la seva pagina de detall
    $(document).on("click", ".movie-link", function (e) {
        let title = document.getElementById("titol-link").innerHTML;

        if (title == '<i class="fa fa-arrow-right mr-1"></i>Go to TV shows<i class="fa fa-arrow-left ml-1"></i>') var url = "https://api.themoviedb.org/3/movie/";
        else var url = "https://api.themoviedb.org/3/tv/";

        // informacio de la peli/serie
        mostrarDetall($(this).attr('id'), url);

        // actors principals de la peli/serie
        mostrarActors($(this).attr('id'), url);

        // imatges de la peli/serie
        mostrarImatges($(this).attr('id'), url);

        // pelis/series relacionades
        mostrarRelacionats($(this).attr('id'), url);

        // valoracions
        mostrarValoracions($(this).attr('id'), url);
    });

    // actualitzar paginacio i info pagina actual quan es cliqui a un numero de pagina
    $(document).on("click", ".page-num", function (e) {
        let pag = $(this).attr('name').substring(5, $(this).attr('name').length);
        if (page != pag) {
            page = pag;
            actualitzarVista();
        }
    });

    // quan s'escriuen com a minim 4 lletres al cercador es mostren opcions d'autocompletar
    $(document).on("keyup", "#cerca", function (e) {
        let keyword = document.getElementById("cerca").value;
        let title = document.getElementById("titol-link").innerHTML;

        if (title == '<i class="fa fa-arrow-right mr-1"></i>Go to TV shows<i class="fa fa-arrow-left ml-1"></i>') {
            var url = "https://api.themoviedb.org/3/search/movie?query="+keyword;
        }
        else {
            var url = "https://api.themoviedb.org/3/search/tv?query="+keyword;
        }

        if (keyword.length > 4) {
            url = url;
            $.ajax({
                url: url,
                data:{
                    api_key: APIKEY,
                }
            }).done(function(data) {            
                let elements = [];          
                for (var i = 0; i < data.results.length; i++) {
                    elements.push(data.results[i].title || data.results[i].name);
                }
                // autocompletar     
                $("#cerca").autocomplete(
                    {
                        source: elements
                    }
                );           
            }).fail(function(data) {
                console.log(data);           
            });
        }        
    });

    // quan es prem la tecla 'intro' al cercador, es fa la cerca
    $(document).on("keyup", "#cerca", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            buscarPelisSeries();
        }      
    });    

    // quan s'amaga la pagina de detall d'una peli, s'amaga el missatge de confirmacio de la valoracio de la peli
    $('#element-detail').on('hidden.bs.modal', function () {        
        $("#thx").addClass("d-none");
    })
});


// obte les pelis mes populars
function getPelisPopulars() {
    mostraLoading();
    let url = "https://api.themoviedb.org/3/movie/popular?page="+page;

    // modifica titol de la pagina
    document.getElementById("titol").innerHTML = "Popular movies";
    document.getElementById("titol-link").innerHTML = '<i class="fa fa-arrow-right mr-1"></i>Go to TV shows<i class="fa fa-arrow-left ml-1"></i>'; 
    document.getElementById("cerca").setAttribute("placeholder", "Search movies");

    getPelis(url);
}


// obte les pelis millor valorades
function getPelisValorades() {
    mostraLoading();
    let url = "https://api.themoviedb.org/3/movie/top_rated?page="+page;

    // modifica titol de la pagina
    document.getElementById("titol").innerHTML = "Top rated movies"; 
    document.getElementById("titol-link").innerHTML = '<i class="fa fa-arrow-right mr-1"></i>Go to TV shows<i class="fa fa-arrow-left ml-1"></i>'; 
    document.getElementById("cerca").setAttribute("placeholder", "Search movies");

    getPelis(url);
}


// obte les series mes populars
function getSeriesPopulars() {
    mostraLoading();
    let url = "https://api.themoviedb.org/3/tv/popular?page="+page;

    // modifica titol de la pagina
    document.getElementById("titol").innerHTML = "Popular TV shows"; 
    document.getElementById("titol-link").innerHTML = '<i class="fa fa-arrow-right mr-1"></i>Go to Movies<i class="fa fa-arrow-left ml-1"></i>'; 
    document.getElementById("cerca").setAttribute("placeholder", "Search TV shows");

    getSeries(url);
}


// obte les series millor valorades
function getSeriesValorades() {
    mostraLoading();
    let url = "https://api.themoviedb.org/3/tv/top_rated?page="+page;

    // modifica titol de la pagina
    document.getElementById("titol").innerHTML = "Top rated TV shows"; 
    document.getElementById("titol-link").innerHTML = '<i class="fa fa-arrow-right mr-1"></i>Go to Movies<i class="fa fa-arrow-left ml-1"></i>'; 
    document.getElementById("cerca").setAttribute("placeholder", "Search TV shows");

    getSeries(url);
}


// segons la pagina que s'estigui visitant es mostren series o pelis
function switchSeriesOrMovies() {  
    if (document.getElementById("titol").innerHTML == "Top rated movies") {
        getSeriesValorades();        
    }
    else if (document.getElementById("titol").innerHTML == "Popular movies") {
        getSeriesPopulars();
    }
    else if (document.getElementById("titol").innerHTML == "Top rated TV shows") {
        getPelisValorades();
    }
    else if (document.getElementById("titol").innerHTML == "Popular TV shows") {
        getPelisPopulars();
    }
    else { // pagina de cerca
        if (document.getElementById("titol-link").innerHTML == '<i class="fa fa-arrow-right mr-1"></i>Go to TV shows<i class="fa fa-arrow-left ml-1"></i>') {
            getSeriesPopulars();
        }
        else {            
            getPelisPopulars();
        }
    }
}


// busca les pelis segons el text entrat al buscador
function buscarPelisSeries() {
    mostraLoading();

    if (document.getElementById("no-results")) {
        document.getElementById("no-results").remove();
    }    
    
    // text del buscador
    let keyword = document.getElementById("cerca").value;       

    // si hi ha text, buscar pelis a partir del mateix
    if (keyword) {
        document.getElementById("cerca").value = '';

        let title = document.getElementById("titol-link").innerHTML;
        document.getElementById("titol").innerHTML = "Search results for: " + keyword;

        if (title == '<i class="fa fa-arrow-right mr-1"></i>Go to TV shows<i class="fa fa-arrow-left ml-1"></i>') {
            var url = "https://api.themoviedb.org/3/search/movie?query="+keyword+"&page="+page;            
            getPelis(url);
        }
        else {
            var url = "https://api.themoviedb.org/3/search/tv?query="+keyword+"&page="+page;
            getSeries(url);
        }
    }
    else {
        amagaLoading();
    }
}


// obte una llista de pelis a partir d'una url
function getPelis(url) {    
    $.ajax({
        url: url,
        data:{
           api_key: APIKEY,
        }
    }).done(function(data){  

        // obtenir total de pagines    
        maxPages = data.total_pages;
        // crear paginació
        makePagination();

        // element on es mostraran les pelis
        let row = document.getElementById("my-elements");

        // s'eliminen elements actuals per emplenar amb les pelis noves obtingudes
        while (row.hasChildNodes()) {
            row.removeChild(row.lastChild);
        }
    
        if (data.results.length > 0) {
            // per cada peli s'obtenen les seves dades
            for (var i = 0; i < data.results.length; i++) {
                $.ajax({
                    url:"https://api.themoviedb.org/3/movie/"+data.results[i].id,
                    data:{
                        api_key: APIKEY,
                    }
                }).done(function(data2) {
                    // es mostren les pelis
                    amagaLoading();
                    return mostrarPeliSerie(data2);
                    
                }).fail(function(data2) {
                    console.log(data2); 
                    amagaLoading();
                });
            }
        }
        else {
            let elem = document.getElementById("elements-container");
            let p = document.createElement("h3");
            p.id = "no-results";
            p.classList.add("text-center","mt-4");
            p.innerHTML = 'NO RESULTS';
            elem.appendChild(p);
            amagaLoading();
        }        
    
    }).fail(function(data){
        console.log(data);
        amagaLoading();
    });  
}


// crea elements html amb les dades d'una peli/serie per mostrar a la pagina principal
function mostrarPeliSerie(data) {
    let row = document.getElementById("my-elements");
    
    let div = document.createElement("div");
    div.classList.add("col-12", "col-sm-6", "col-md-4", "col-lg-3");

    let link = document.createElement("a");
    link.href = "#";
    link.id = data.id;
    link.setAttribute("data-toggle", "modal");
    link.setAttribute("data-target", "#element-detail");
    link.classList.add("movie-link");
    
    let card = document.createElement("div");
    card.classList.add("card", "card-blog", "fill-light");
    let card_img = document.createElement("div");
    card_img.classList.add("card-image");
    let card_content = document.createElement("div");
    card_content.classList.add("content");

    let img = document.createElement("img");
    if (data.backdrop_path) img.src = 'https://image.tmdb.org/t/p/w500'+data.backdrop_path;
    else img.src = '';
    img.alt = (data.title || data.name);

    let h2 = document.createElement("h2");
    h2.innerHTML = (data.title || data.name);

    let p = document.createElement("p");
    p.innerHTML = (data.tagline || data.status);

    card_content.appendChild(h2);
    card_content.appendChild(p);
    card_img.appendChild(img);
    card.appendChild(card_img);
    card.appendChild(card_content);
    link.appendChild(card);
    div.appendChild(link);
    row.appendChild(div); 
}


// busca els detalls de la peli/serie clicada i es creen elements html per mostrar-los a la pagina de detall
function mostrarDetall(id, url) {
    mostraLoading();
    $.ajax({
        url: url+id,
        data:{
            api_key: APIKEY,
        }
    }).done(function(data){
        // obtenir element de la imatge principal de la peli/serie
        let image = document.getElementById("main-image");

        // eliminar la imatge actual
        while (image.hasChildNodes()) {
            image.removeChild(image.lastChild);
        }       

        // mostrar nova imatge
        let img = document.createElement("img");
        if (data.poster_path) img.src = 'https://image.tmdb.org/t/p/original'+data.poster_path;
        else img.src = '';
        img.alt = (data.title || data.name);
        image.appendChild(img);
    
        // obtenir element de la informacio de la peli/serie
        let info = document.getElementById("element-info");

        // eliminar la informacio actual
        while (info.hasChildNodes()) {
            info.removeChild(info.lastChild);
        }

        // mostrar nova informacio
        let h2 = document.createElement("h2");
        h2.innerHTML = (data.title || data.name);
        let span = document.createElement("span");

        if (data.release_date != undefined) span.innerHTML = (" ("+data.release_date.substring(0, 4)+")");
        else span.innerHTML = (" ("+data.first_air_date.substring(0, 4)+")");

        let par1 = document.createElement("div");
        par1.innerHTML = '<div class="average"><div class="vote_average">'+ data.vote_average +'</div><div class="vote_average_text">Vote average</div></div><div class="starrating d-flex flex-row-reverse"><input type="radio" name="rating" value="5" id="star5" onclick="puntua();"><label class="fa fa-star" for="star5"></label></input><input type="radio" name="rating" value="4" id="star4" onclick="puntua();"><label class="fa fa-star" for="star4"></label></input><input type="radio" name="rating" value="3" id="star3" onclick="puntua();"><label class="fa fa-star" for="star3"></label></input><input type="radio" name="rating" value="2" id="star2" onclick="puntua();"><label class="fa fa-star" for="star2"></label></input><input type="radio" name="rating" value="1" id="star1" onclick="puntua();"><label class="fa fa-star" for="star1"></label></input></div>';
        
        let par3 = document.createElement("div");
        
        // mostrar generes
        for (var i = 0; i < data.genres.length; i++) {
            par3.innerHTML += '<span class="badge badge-genre">'+ data.genres[i].name +'</span>';
        }
    
        h2.appendChild(span);
        info.appendChild(h2);
        info.appendChild(par1);
        info.appendChild(par3);          

        let general = document.getElementById("element-general");

        // eliminar la descripcio actual
        while (general.hasChildNodes()) {
            general.removeChild(general.lastChild);
        }
        general.innerHTML = (data.overview || 'NO DESCRIPTION');
        
        amagaLoading();
        
    }).fail(function(data){
        console.log(data);
        amagaLoading();
    });     
}


// busca les imatges de la peli/serie clicada i es creen elements html per mostrar-les a la pagina de detall
function mostrarImatges(id, url) {
    mostraLoading();
    $.ajax({
        url: url+id+"/images",
        data:{
            api_key: APIKEY,
        }
    }).done(function(data){

        // obtenir element que conte les imatges
        let ul = document.getElementById("element-images");

        // eliminar les imatges actuals
        while (ul.hasChildNodes()) {
            ul.removeChild(ul.lastChild);
        }

        if (data.backdrops.length > 0) {
            for (var i = 1; i < 11; i++) {           

                if (i > data.backdrops.length-1) {
                    break;
                }
        
                let li = document.createElement("li");
                li.classList.add("image-detail");

                let img_wrap = document.createElement("div");
                img_wrap.classList.add("image-wrapper-detail");
            
                let img = document.createElement("img");
                if (data.backdrops[i].file_path) img.src = 'https://image.tmdb.org/t/p/w500'+data.backdrops[i].file_path;
                else img.src = '';
                img.alt = data.backdrops[i].file_path;

                img_wrap.appendChild(img);
                li.appendChild(img_wrap);
                ul.appendChild(li);
            }
        }
        else {
            let p = document.createElement("p");
            p.innerHTML = 'NO IMAGES';
            ul.appendChild(p); 
        }
        amagaLoading();

    }).fail(function(data){
        console.log(data);
        amagaLoading();
    });     
}


// busca els actors principals de la peli/serie clicada i es creen elements html per mostrar-los a la pagina de detall
function mostrarActors(id, url) {
    mostraLoading();
    $.ajax({
        url: url+id+"/credits",
        data:{
            api_key: APIKEY,
        }
    }).done(function(data){        

        // obtenir element que conte els actors
        let ul = document.getElementById("element-cast");

        // eliminar actors actuals
        while (ul.hasChildNodes()) {
            ul.removeChild(ul.lastChild);
        }
        
        if (data.cast.length > 0) {
            for (var i = 0; i < 10; i++) {         
                
                if (i > data.cast.length-1) {
                    break;
                }
        
                let card = document.createElement("li");
                card.classList.add("card", "card-tabs", "card-block");

                let div = document.createElement("div");
                div.classList.add("mr-3");

                let span = document.createElement("span");

                // imatge de l'actor
                let img = document.createElement("img");
                img.classList.add("card-img-top");
                img.alt = data.cast[i].name;
                if(data.cast[i].profile_path) img.src = 'https://image.tmdb.org/t/p/w500'+data.cast[i].profile_path;
                else img.src = '';            

                let cardbody = document.createElement("div");
                cardbody.classList.add("card-body");

                let p = document.createElement("p");
                p.classList.add("card-text");

                // nom de l'actor
                let span1 = document.createElement("span");
                span1.classList.add("card-title");
                span1.innerHTML = data.cast[i].name;

                let br = document.createElement("br");
                
                // nom del personatge
                let span2 = document.createElement("span");
                span2.classList.add("card-subtitle");
                span2.innerHTML = data.cast[i].character;

                p.appendChild(span1);
                p.appendChild(br);
                p.appendChild(span2);
                cardbody.appendChild(p);            
                span.appendChild(img);
                card.appendChild(span);
                card.appendChild(cardbody);
                div.appendChild(card);
                ul.appendChild(div);            
            }   
        }    
        else {
            let p = document.createElement("p");
            p.innerHTML = 'NO CAST';
            ul.appendChild(p); 
        }
        
        amagaLoading();

    }).fail(function(data){
        console.log(data);
        amagaLoading();
    });     
}


// busca les pelis/series relacionades a partir de la peli clicada i es creen elements html per mostrar-los a la pagina de detall
function mostrarRelacionats(id, url) {
    mostraLoading();
    $.ajax({
        url: url+id+"/recommendations",
        data:{
            api_key: APIKEY,
        }
    }).done(function(data){

        // obtenir element que conte les pelis/series relacionades
        let ul = document.getElementById("element-rel");

        // eliminar pelis/series relacionades actuals
        while (ul.hasChildNodes()) {
            ul.removeChild(ul.lastChild);
        }        

        if (data.results.length > 0) {
            for (var i = 0; i < 6; i++) {      
                
                if (i > data.results.length-1) {
                    break;
                }
        
                let card = document.createElement("li");
                card.classList.add("card", "card-tabs", "card-block");

                let div = document.createElement("div");
                div.classList.add("mr-3");

                let span = document.createElement("span");

                // imatge de la peli/serie
                let img = document.createElement("img");
                img.classList.add("card-img-top");
                img.alt = (data.results[i].title || data.results[i].name);
                if(data.results[i].poster_path) img.src = img.src = 'https://image.tmdb.org/t/p/w500'+data.results[i].poster_path;
                else img.src = '';  

                let cardbody = document.createElement("div");
                cardbody.classList.add("card-body");

                let p = document.createElement("p");
                p.classList.add("card-text");

                // titol de la peli/serie
                let span1 = document.createElement("span");
                span1.classList.add("card-title");
                span1.innerHTML = (data.results[i].title || data.results[i].name);

                let br = document.createElement("br");
                
                // any de la peli/serie
                let span2 = document.createElement("span");
                span2.classList.add("card-subtitle");

                if (data.results[i].release_date != undefined) span2.innerHTML = (" ("+data.results[i].release_date.substring(0, 4)+")");
                else span2.innerHTML = (" ("+data.results[i].first_air_date.substring(0, 4)+")");

                p.appendChild(span1);
                p.appendChild(br);
                p.appendChild(span2);
                cardbody.appendChild(p);            
                span.appendChild(img);
                card.appendChild(span);
                card.appendChild(cardbody);
                div.appendChild(card);
                ul.appendChild(div);            
            }  
        }
        else {
            let p = document.createElement("p");
            p.innerHTML = 'NO RELATED';
            ul.appendChild(p); 
        }
        
        amagaLoading();

    }).fail(function(data){
        console.log(data);
        amagaLoading();
    });
}


// busca les valoracions dels usuaris a partir de la peli/serie clicada i es creen elements html per mostrar-los a la pagina de detall
function mostrarValoracions(id, url) {
    mostraLoading();
    $.ajax({
        url: url+id+"/reviews",
        data:{
            api_key: APIKEY,
        }
    }).done(function(data){

        // obtenir element que conte les valoracions d'usuaris
        let ul = document.getElementById("element-val");

        // eliminar valoracions actuals
        while (ul.hasChildNodes()) {
            ul.removeChild(ul.lastChild);
        }

        if (data.results.length > 0) {
            for (var i = 0; i < data.results.length; i++) {
                let li = document.createElement("li");
                li.classList.add("list-group-item");
    
                // usuari
                let strong = document.createElement("strong");
                strong.innerHTML = data.results[i].author;
    
                // valoracio
                let p = document.createElement("p");
                p.innerHTML = data.results[i].content;
    
                li.appendChild(strong);
                li.appendChild(p);
                ul.appendChild(li);                    
            }
        }
        else {
            let p = document.createElement("p");
            p.innerHTML = 'NO COMMENTS';
            ul.appendChild(p); 
        }        
        
        amagaLoading();

    }).fail(function(data){
        console.log(data);
        amagaLoading();
    });
}


// obte una llista de series a partir d'una url
function getSeries(url) {    
    $.ajax({
        url: url,
        data:{
           api_key: APIKEY,
        }
    }).done(function(data){  

        // obtenir total de pagines    
        maxPages = data.total_pages;
        // crear paginació
        makePagination();

        // element on es mostraran les series
        let row = document.getElementById("my-elements");

        // s'eliminen elements actuals per emplenar amb les series noves obtingudes
        while (row.hasChildNodes()) {
            row.removeChild(row.lastChild);
        }
    
        if (data.results.length > 0) {
            // per cada peli s'obtenen les seves dades
            for (var i = 0; i < data.results.length; i++) {
                $.ajax({
                    url:"https://api.themoviedb.org/3/tv/"+data.results[i].id,
                    data:{
                        api_key: APIKEY,
                    }
                }).done(function(data2) {
                    // es mostren les series
                    amagaLoading();
                    return mostrarPeliSerie(data2);
                    
                }).fail(function(data2) {
                    console.log(data2); 
                    amagaLoading();              
                });
            }
        }
        else {
            let elem = document.getElementById("elements-container");
            let p = document.createElement("h3");
            p.id = "no-results";
            p.classList.add("text-center","mt-4");
            p.innerHTML = 'NO RESULTS';
            elem.appendChild(p);
            amagaLoading();   
        }        
    
    }).fail(function(data){
        console.log(data);
        amagaLoading();
    });  
}


// mostra el gif de carregar dades
function mostraLoading() {
    document.getElementById("loading").style.display = 'block';
}


// amaga el gif de carregar dades
function amagaLoading() {
    document.getElementById("loading").style.display = 'none';
}


// desactiva la possibilitat de valorar una peli/serie quan ja s'ha valorat
function puntua() {

    // desactiva estrelles de valoracio
    document.getElementById("star1").disabled = true;
    document.getElementById("star2").disabled = true;
    document.getElementById("star3").disabled = true;
    document.getElementById("star4").disabled = true;
    document.getElementById("star5").disabled = true;
    $('.starrating input').addClass('no-hover');

    // mostra missatge de confirmacio
    $('#thx').removeClass("d-none");
}


// Mostra els numeros de pàgina
function makePagination() {

    // eliminar tots els numeros per crear la nova paginacio
    var pages = document.getElementById("pages");
        
    while (pages.hasChildNodes()) {
        pages.removeChild(pages.lastChild);
    }

    // crear les pagines segons el nombre maxim de pagines que contenen les pelis/series
    for (var i = 1; i <= maxPages; i++) {
        let li = document.createElement("li");
        li.classList.add("page-item", "page-num", "page-"+i);
        li.setAttribute("name", "page-"+i);
        let a = document.createElement("a");
        a.classList.add("page-link");
        a.setAttribute("href", "#");
        a.innerHTML = i;

        li.appendChild(a);
        pages.appendChild(li);
    }

    // amagar tots els numeros de pagina
    $('.page-num').hide();
    $('.page-num').removeClass('active');
    
    // mostrar les pagines que toquen segons la pagina actual que s'esta visitant
    if (page < 4) {
        $('.page-1').show();
        $('.page-2').show();
        $('.page-3').show();
        $('.page-4').show();
        $('.page-'+page).addClass('active');
    }
    else if (page > maxPages-4) {
        $('.page-'+maxPages).show();
        $('.page-'+(maxPages-1)).show();
        $('.page-'+(maxPages-2)).show();
        $('.page-'+(maxPages-3)).show();
        $('.page-'+page).addClass('active');
    }
    else if (page >= 4 && page <= maxPages-4) {
        let p = page;
        $('.page-'+(page-2)).show();
        $('.page-'+(page-1)).show();
        $('.page-'+page).show();
        p++;
        $('.page-'+(p)).show();
        $('.page-'+page).addClass('active');
    }

    // desactivar botons en el cas que s'estigui a la primera o última pagina
    $('.page-first').removeClass('disabled');
    $('.page-prev').removeClass('disabled');
    $('.page-last').removeClass('disabled');
    $('.page-next').removeClass('disabled');
    if (page == 1 && maxPages > 1) {
        $('.page-first').addClass('disabled');
        $('.page-prev').addClass('disabled');
    }
    else if (page == maxPages && maxPages > 1) {
        $('.page-last').addClass('disabled');
        $('.page-next').addClass('disabled');
    }
    else if (maxPages == 1) {
        $('.page-first').addClass('disabled');
        $('.page-prev').addClass('disabled');
        $('.page-last').addClass('disabled');
        $('.page-next').addClass('disabled');
    }
}


// es modifica la pagina visitada segons el boto de la paginacio que es cliqui
function changePage(type) {    
    switch (type) {
        // anar a la pagina 1
        case 'first':
            page = 1;    
            actualitzarVista();
            break;
        // anar a la ultima pagina
        case 'last':
            page = maxPages;
            actualitzarVista();
            break;
        // anar a la seguent pagina segons la actual
        case 'next':
            if (page < maxPages) {
                page++;
                actualitzarVista();
            }
            break;
        // anar a la pagina anterior segons la actual
        case 'prev':
            if (page > 1) {
                page--;
                actualitzarVista();
            } 
    }
}


// s'actualitza la informacio de la pagina segons l'apartat que s'estigui consultant
function actualitzarVista() {
    if (document.getElementById("titol").innerHTML == "Top rated movies") {
        getPelisValorades();
    }
    else if (document.getElementById("titol").innerHTML == "Popular movies") {
        getPelisPopulars();
    }
    else if (document.getElementById("titol").innerHTML == "Popular TV shows") {
        getSeriesPopulars();
    }
    else if (document.getElementById("titol").innerHTML == "Top rated TV shows") {
        getSeriesValorades();
    }
    else {
        buscarPelisSeries();
    }
}
