# -*- coding:utf8 -*-

import sys
version= sys.version[0]
if version=="3":
    import deploy3
elif version=="2":
    import deploy2
else:
    try:
        eval("print( 'Unknown version Python' )")
    except:
        eval("print 'Unknown version Python'")
