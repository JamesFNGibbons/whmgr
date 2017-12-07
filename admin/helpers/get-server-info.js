const os = require('os');

module.exports = function(){
  return `
    <b>System Hostname</b>      <br>
    ${os.hostname()}            <br>
    <b>Operating System</b>     <br>
    ${os.type()} / ${os.arch()} <br>
    <b>OS Release</b>           <br>
    ${os.release()}             <br>
    <b>System Uptime</b>        <br>
    ${(os.uptime()/60)/60} Hours<br>
  `;
}
