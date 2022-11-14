const api = "https://randomuser.me/api/?results=12&nat=us"
const gallery = document.querySelector('.gallery');
const body = document.querySelector('body');
const search = document.querySelector('.search-input');

let matches = []; //initializing array of employees (Used throughout the app)
let employeeNumber = 0; //initializing index number of employees (Used in getEmployeeNumber())


/***
 * Search Event 
 * 
 * Based on the input of user, this event will filter through the matches array and remove non-matching
 * employees based on the their 'first', 'last' and a combination of 'first' + 'last' name. 
 * 
 */
search.addEventListener('keyup', (e) => {
    let string= e.target.value;
    let lowercaseString = string.toLowerCase();
    if(string !== ''){
        let searchResults = matches.filter(employee => {
            const fullName = `${employee.name.first} ${employee.name.last}`;
            return (
                employee.name.first.toLowerCase().includes(lowercaseString) || 
                employee.name.last.toLowerCase().includes(lowercaseString) ||
                fullName.toLowerCase().includes(lowercaseString)
            );
        })
        gallery.innerHTML = ''; 
        generateHTML(searchResults);

    } else {
        gallery.innerHTML = '';
        generateHTML(matches);
    }
 })



/**
 *  loadEmployees()
 *  Fetches data and saves data to our empty array 'matches.' We use the data to generate the HTML. Using 
 *  the function generateHTML(). 
 * 
 * Called at the bottom of the code. 
 */
async function loadEmployees(){
    try {
        const response = await fetch(api);
        const data = await response.json();
        matches = data.results;
        generateHTML(matches);
    } catch (err) {
        err; 
    }
}


/**
 * generateHTML()
 * @param {array} array - data that was fetched from our loadEmployees function. 
 * 
 * The array is looped through and is appended into the gallery. After all the employees have been appened,
 * we call the employeeClick function and pass through the array again. 
 * 
 * This function is used in loadEmployees() function
 */

function generateHTML(array){
    array.forEach((employee,index) => {
    let html = `
        <div class="card" data-index=${index}> 
            <div class="card-img-container">
                <img class="card-img" src="${employee.picture.large}" alt="profile picture">
            </div>
            <div class="card-info-container">
                <h3 id="name" class="card-name cap">${employee.name.first} ${employee.name.last}</h3>
                <p class="card-text">${employee.email}</p>
                <p class="card-text cap">${employee.location.city}, ${employee.location.state}</p>
            </div>
        </div>
    `;
    gallery.insertAdjacentHTML('beforeend', html);
    });
    employeeClick(array);
};



/**
 * employeeClick()
 * @param {array} array - here again we pass through the array of data that was retrieved 
 * from the loadEmployees function. 
 * 
 * This function holds the click event listeners for the 'cards' that are appeneded on the page. 
 */
function employeeClick(array){
    const cards = [...gallery.children];
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            let select = e.target.closest('.card'); //locates the closest '.card' 
            let index = select.getAttribute('data-index'); //gets the index of the '.card' clicked
            getEmployeeNumber(index); //uses the index from above to change the variable 'employeeNumber' 
            let employee = array[index]; //initializing employee based on the array and its associated index

            //If our array.length = 1, then there is no purpose for having the prev and next button. This part removes it
            if(array.length == 1){ 
                modalText(employee,array);
                const info = document.querySelector('.modal-btn-container');
                modalBtns(array);
                info.remove();
            } else {

            //If the array.length is not 1, then we check the index of the card selected. 
                if (index == 0) {

                    //if, index = 0, then there is no person before them
                    modalText(employee,array); //modal html for employee selected
                    document.getElementById('modal-prev').style.display = "none"; //removes previous button
                    document.getElementById('modal-next').style.display = "block";//shows next button
                    modalBtns(array); //Event listener for the buttons on the modal
                } else if (index == matches.length - 1){

                    //if index is the last person then there is no one after them
                    modalText(employee,array); //modal html for employee selected
                    document.getElementById('modal-prev').style.display = "block";//shows previous button
                    document.getElementById('modal-next').style.display = "none";//removes next button
                    modalBtns(array); //Event listener for the buttons on the modal
                } else {
                    
                    //if the card that is selected is inbetween the first and last then, we create the modal 
                    // and call the modal event listeners. 
                    modalText(employee,array);
                    modalBtns(array);
                }
            }
        })

    })
}


/**
 * modalText()
 * @param {*} employee - this employee is selected through the click event listener.
 * 
 * This function is create the modal based on the employee selected. The html for the modal is appended 
 * to the body of the html code. 
 * 
 * This function is called in our employeeClick() function.
 */
function modalText(employee){
    //Changing the format of the dob date retrieved from the json. 
    let dob = employee.dob.date;
    let regex = /^(\d{4})-(\d{2})-(\d{2})(.*)/;
    let replacement = '$2/$3/$1';
    let string = dob.replace(regex,replacement);

    //HTML creation 
    let html = `
    <div class="modal-container">
        <div class="modal">
            <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
            <div class="modal-info-container">
                <img class="modal-img" src="${employee.picture.large}" alt="profile picture">
                <h3 id="name" class="modal-name cap">${employee.name.first} ${employee.name.last}</h3>
                <p class="modal-text">${employee.email}</p>
                <p class="modal-text cap">${employee.location.city}</p>
            <hr>
                <p class="modal-text">${employee.cell}</p>
                <p class="modal-text">${employee.location.street.number} ${employee.location.street.name}, ${employee.location.city}, ${employee.location.state}, ${employee.location.postcode}</p>
                <p class="modal-text">Birthday: ${string}</p>
                </div>
        </div>
            <div class="modal-btn-container">
                <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
                <button type="button" id="modal-next" class="modal-next btn">Next</button>
            </div>
    </div>
        `;        
    body.insertAdjacentHTML('beforeend',html);
}


/** 
 * modalInfoNext
 * @param {*} employee - Employee that was clicked from clickedEmployee
 * @param {*} array -  data from json
 * 
 * The purose of this function is to create the modalInfo based on if the modal button next is clicked. 
 * The function creates new info for the employee index + 1. 
 * 
 * This function is called in modalBtns() function. 
 * 
*/
function modalInfoNext(employee,array){
    const modal = document.querySelector('.modal');

    //Changing the format of the dob date retrieved from the json. 
    let dob = employee.dob.date;
    let regex = /^(\d{4})-(\d{2})-(\d{2})(.*)/;
    let replacement = '$2/$3/$1';
    let string = dob.replace(regex,replacement);

    //html creation
    let html = `
        <div class="modal-info-container">
            <img class="modal-img" src="${employee.picture.large}" alt="profile picture">
            <h3 id="name" class="modal-name cap">${employee.name.first} ${employee.name.last}</h3>
            <p class="modal-text">${employee.email}</p>
            <p class="modal-text cap">${employee.location.city}</p>
        <hr>
            <p class="modal-text">${employee.cell}</p>
            <p class="modal-text">${employee.location.street.number} ${employee.location.street.name}, ${employee.location.city}, ${employee.location.state}, ${employee.location.postcode}</p>
            <p class="modal-text">Birthday: ${string}</p>
        </div>
        `;
    modal.insertAdjacentHTML('beforeend',html);

    employeeNumber++; //increasing the employeeNumber by 1 
    let length = array.length - 1;
    //checking if employee is last on the list. If the employee is last then we remove the next button.
    if(employee === array[length]){
        document.getElementById('modal-next').style.display = "none";
    }
}

function modalInfoPrev(employee, array){
    const modal = document.querySelector('.modal');

    //Changing the format of the dob date retrieved from the json. 
    let dob = employee.dob.date;
    let regex = /^(\d{4})-(\d{2})-(\d{2})(.*)/;
    let replacement = '$2/$3/$1';
    let string = dob.replace(regex,replacement);

    //html creation
    let html = `
        <div class="modal-info-container">
            <img class="modal-img" src="${employee.picture.large}" alt="profile picture">
            <h3 id="name" class="modal-name cap">${employee.name.first} ${employee.name.last}</h3>
            <p class="modal-text">${employee.email}</p>
            <p class="modal-text cap">${employee.location.city}</p>
        <hr>
            <p class="modal-text">${employee.cell}</p>
            <p class="modal-text">${employee.location.street.number} ${employee.location.street.name}, ${employee.location.city}, ${employee.location.state}, ${employee.location.postcode}</p>
            <p class="modal-text">Birthday: ${string}</p>
        </div>
        `;
    modal.insertAdjacentHTML('beforeend',html);

    //decreaing employeeNumber by 1 
    employeeNumber--;


    //checking if the employee is first, if the employee is first then we remove previous button.
    if(employee === array[0]){
        document.getElementById('modal-prev').style.display = "none";
    }
}


/**
 *           modalBtns()
 * @param {*} array - data from the json 
 * 
 * This function holds the event listeners for the modal buttons. 
 * The three are listed below: 
 * 
 * 1) button close - this event removes the modal container. 
 * 2) button previous - this event removes the info from the modal container and calls modalInfoPrev()
 *                      to insert the previous employees information. 
 * 3) button next - this event removes the info from the modal container and calls modalInfoNext()
 *                  to inseart the next employees information. 
 * 
 */
function modalBtns(array){
    document.querySelector('.modal-close-btn').addEventListener('click', (e) => {
        const container = document.querySelector('.modal-container');
        if(e.target.innerHTML === "X"){
            container.remove();
        }
    })

    document.querySelector('.modal-prev').addEventListener('click', (e) => {
        newIndex = parseInt(employeeNumber) - 1;
        if(e.target.innerHTML === "Prev"){
            if (newIndex < 11){
                const info = document.querySelector('.modal-info-container');
                document.getElementById('modal-next').style.display = "block";
                info.remove();
                let employee = array[newIndex];
                modalInfoPrev(employee,array);
            }
        }
    })
    
    document.querySelector('.modal-next').addEventListener('click', (e) => {
        newIndex = parseInt(employeeNumber) + 1; 
        if(e.target.innerHTML === "Next"){
            if (newIndex > 0){
                document.getElementById('modal-prev').style.display = "block";
                const info = document.querySelector('.modal-info-container');
                info.remove();
                let employee = array[newIndex];
                modalInfoNext(employee,array);
            }
        }
    })
}

// Function to update the employeeNumber outside of the fetch
function getEmployeeNumber(event){
    return employeeNumber = event;
}

loadEmployees();