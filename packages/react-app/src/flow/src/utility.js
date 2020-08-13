// export const nodeWithId = (name) => document.getElementById(name);

// const urlParams = {
//   url: "",
//   params: {},
// };
// export const getUrlParam = (name) => {
//   const currentUrl = window.location.href || "";
//   if (urlParams.url !== currentUrl) {
//     urlParams.url = currentUrl;
//     const params = currentUrl.split("?")[1];
//     urlParams.params = params
//       ? params.split("&").reduce((acc, item) => {
//           const [key, value] = item.split("=");
//           acc[key] = value;
//           return acc;
//         }, {})
//       : {};
//   }
//   return urlParams.params[name];
// };

export const generateCode = async (url, match) => {
    const codeFile = await fetch(url);
    const rawCode = await codeFile.text();
    if (!match) {
      return rawCode;
    }
  
    const { query } = match;
    return rawCode.replace(query, (item) => {
      return match[item];
    });
};
  
export const getAddress = (user, nullPrefix = true) => {
  return nullPrefix ? `0x${user.addr}` : user.addr;
};

export const getEthereumID = (tokenID) => {
  return `"${tokenID}"`;
}; 