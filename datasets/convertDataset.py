from zipfile import ZipFile
'''
def extract_zip(input_zip):
    input_zip=ZipFile(input_zip)
    return {name: input_zip.read(name) for name in input_zip.namelist()}
'''
# References:
# http://stackoverflow.com/questions/10908877/extracting-a-zipfile-to-memory