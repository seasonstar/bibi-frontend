'use strict';

var SERVER = 'http://api.maybi.cn';
var TEST_SERVER = 'http://192.168.31:134:5000';
var header_left_buttons = {
    "default": {
        "icon": "back",
        "ngHref": "back",
        "show": true
    },
    "profile": {
        "icon": "profile",
        "ngHref": "account",
        "show": true
    },
    "login": {
        "icon": "profile",
        "ngHref": "login",
        "show": true
    },
    "home": {
        "icon": "home",
        "ngHref": "/",
        "show": true
    },
    "blank": {
        "text": "",
        "ngHref": "",
        "show": false
    }
};
var header_right_buttons = {
    "default": {
        "text": "",
        "ngHref": "",
        "show": false
    },
    "cart": {
        "icon": "cart",
        "ngHref": "cart",
        "show": true
    },
    "register": {
        "text": "注册",
        "ngHref": "register",
        "show": true
    },
    "save_my_seat_rule": {
        "text": "规则",
        "ngHref": "",
        "show": true
    }
};

var AppSettings = {
    appTitle: '您在北美最亲近的华人生活帮手 - 美比',
    SERVER: SERVER,
    TEST_SERVER: TEST_SERVER,
    header_left_buttons: header_left_buttons,
    header_right_buttons: header_right_buttons
};

module.exports = AppSettings;
