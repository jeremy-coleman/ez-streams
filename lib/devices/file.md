## File based ES streams

`var ezs = require('ez-streams');`

* `reader = ezs.devices.file.text.reader(path, encoding)`  
  creates an EZ reader that reads from a text file.    
  `encoding` is optional. It defaults to `'utf8'`.  
* `writer = ezs.devices.file.text.writer(path, encoding)`  
  creates an EZ writer that writes to a text file.    
  `encoding` is optional. It defaults to `'utf8'`.  
* `reader = ezs.devices.file.binary.reader(path)`  
  creates an EZ reader that reads from a binary file.    
* `writer = ezs.devices.file.binary.writer(path)`  
  creates an EZ writer that writes to a binary file.    