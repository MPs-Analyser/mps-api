import { ParsedQs } from 'qs';

export const getQueryParam = (
  query: ParsedQs,
  paramName: string,
  defaultValue: string | number | boolean | undefined
): string | number | boolean | undefined => {

  const value = query[paramName];

  if (!value) {
    return defaultValue;
  }

  let returnValue: any = value;  

  const parsedValue = Number(value);
  //some organisation names are numbers but we want to treat them as strings
  if (!paramName.toLowerCase().includes("name") && !isNaN(parsedValue)) {    
    returnValue = parsedValue; // Return the parsed number if valid
  } else {
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true' || value.toLowerCase() === 'yes') {
        returnValue = true;
      } else if (value.toLowerCase() === 'false' || value.toLowerCase() === 'no') {
        returnValue = false;
      } else {
        returnValue = value.trim();
      }
    }  
  }  
  console.log(`val/key/ret ${value}/${paramName}/${returnValue}`);
  return returnValue;
}