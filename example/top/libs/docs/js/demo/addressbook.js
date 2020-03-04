var list = Top.Data.create({
    users: [{
        name: "Kim",
        age: "30",
        location: "Seoul"
    }, {
        name: "Lee",
        age: "40",
        location: "Incheon"
    }, {
        name: "Park",
        age: "50",
        location: "Busan"
    }]
});
var user = Top.Data.create({
    name: "",
    age: "",
    location: ""
});

function addUser() {
    list.addValue('users', user);
    user.reset();
}

function removeUser() {
    var index = Top.Dom.selectById("table1").getClickedIndex();
    list.removeValue('users.' + index);
    user.reset();
}

function selectUser(index, data) {
    user.setValues(data);
}
