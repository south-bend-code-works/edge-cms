# WhoIsWrapper.py
# Wrapper for linux "whois" command

import subprocess
import re

# Runs the whois command with the given url as a parameter
# Returns a WhoIsResult object describing the url
# Throws a CalledProcessError if error occurs on whois call
def getSiteInfo(webUrl):
	try:
		output = subprocess.check_output(["whois", webUrl]).decode()
	except subprocess.CalledProcessError as e:
		raise

	# Match parameters in whois output
	try:
		domain = re.search(r"Domain Name:\s*([^\n]+\n)", output).group(1).strip()
		name = re.search(r"Registrant Name:\s*([^\n]+\n)", output).group(1).strip()
		phone = re.search(r"Registrant Phone:\s*([^\n]+\n)", output).group(1).strip()
		email = re.search(r"Registrant Email:\s*([^\n]+\n)", output).group(1).strip()
	except AttributeError:
		raise

	return WhoIsResult(domain, name, phone, email)

# Class to describe the result of a whois call
class WhoIsResult:
	def __init__(self, domain, name, phone, email):
		self.domain = domain
		self.name = name
		self.phone = phone
		self.email = email