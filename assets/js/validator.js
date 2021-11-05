//Đối tượng Validator
//Nguyên tắc của các rules:
//1. khi có lỗi trả ra mes lỗi
//2. khi hợp lệ ko trả ra gì cả(undefined)
function Validator(options) {

    function getParent(element, selector) {

        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }


    var selectorRules = {}


    //thực hiện validate
    function Validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage;

        //selectorRules[rule.selector] == rule.test
        var rules = selectorRules[rule.selector]

        // Lặp qua và thực hiện các rule
        // Nếu có lỗi thì sẽ dừng việc kiểm tra
        for (var rule in rules) {
            errorMessage = rules[rule](inputElement.value)
            if (errorMessage) break;
        }
        // for(var i = 0; i < rules.length; i++) {
        //     errorMessage = rules[i](inputElement)
        //     if(errorMessage) break;
        // }

        if (errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')

        }
        //nếu tồn tại errorMessage => !true=false
        //nếu ko tồn tại => !false => true
        return !errorMessage;
    }

    //Lấy element của form cần validate
    var formElement = document.querySelector(options.form)
    if (formElement) {
        //khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;

            // Lặp qua từng rules và validate
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector)

                //nếu tất cả trường input validate = true 
                //Validate(inputElement, rule) không tồn tại errorMessage (Validate return true)
                var isValid = Validate(inputElement, rule);
                if (!isValid) { //Nếu có 1 trường không validate
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                //trường hợp submit với javascript
                if (typeof options.onSubmit === 'function') {

                    //các input hợp lệ
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');

                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        values[input.name] = input.value
                        return values;
                    }, {});
                    //formValue làm đối số 
                    options.onSubmit(formValues);
                }
                //trường hợp submit với hành vi mặc định
                else {
                    formElement.submit();
                }
            }
        }

        //Xử lý lặp qua mỗi rules và xử lý (lắng nhe sự kiện blur,input,...)
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
                var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)


                errorElement.innerText = ''
                getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
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