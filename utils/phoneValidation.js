exports.isPhoneNumber = (phone) => {
    const regex_phone = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    return regex_phone.test(phone);
}