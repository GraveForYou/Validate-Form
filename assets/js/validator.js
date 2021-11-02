//Đối tượng Validator
//Nguyên tắc của các rules:
//1. khi có lỗi trả ra mes lỗi
//2. khi hợp lệ ko trả ra gì cả(undefined)
function Validator(options) {

    var selectorRules = {}


    //thực hiện validate
    function Validate(inputElement, rule) {
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector)
        var errorrMessage;


        var rules = selectorRules[rule.selector]

        //lặp qua và thực hiện các rule, có lỗi thì sẽ dừng lại ở rule đó
        for (var rule in rules) {
            errorrMessage = rules[rule](inputElement.value)
            if (errorrMessage) break;
        }

        if (errorrMessage) {
            errorElement.innerText = errorrMessage
            inputElement.parentElement.classList.add('invalid')
        } else {
            errorElement.innerText = ''
            inputElement.parentElement.classList.remove('invalid')

        }
    }

    //Lấy element của form cần validate
    var formElement = document.querySelector(options.form)
    if (formElement) {

        options.rules.forEach(function(rule) {

            //lưu lại các rules cho mỗi input

            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector)

            //Xử lý trường hợp blur khỏi input
            if (inputElement) {
                inputElement.onblur = function() {
                    Validate(inputElement, rule)
                }
            }

            //Xử lý trường hợp người dùng nhập vào input
            inputElement.oninput = function() {
                var errorElement = inputElement.parentElement.querySelector(options.errorSelector)


                errorElement.innerText = ''
                inputElement.parentElement.classList.remove('invalid')
            }
        });
    }
}

//Định nghĩa rules
Validator.isRequired = function(selector, message) {

    return {
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này'
        }
    };
}

Validator.isEmail = function(selector, message) {

    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    };
}

Validator.isMinlength = function(selector, min, message) {

    return {
        selector: selector,
        test: function(value) {
            return value.length >= 6 ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    };
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {

    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    };
}