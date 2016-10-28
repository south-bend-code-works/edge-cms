from django.shortcuts import render
from . import WhoIsWrapper
from django.core.mail import send_mail
import smtplib
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import subprocess

# Views for owner_conf app

@csrf_exempt
def confirm_owner(request):
	domain = request.POST.get('domain', '')
	try:
		siteInfo = WhoIsWrapper.getSiteInfo(domain)
	except subprocess.CalledProcessError:
		# Report failure of whois
		return JsonResponse({"status": "Failure", "message": "Problem checking domain owner"})
	except AttributeError:
		# Report improper output of whois
		return JsonResponse({"status": "Failure", "message": "Unable to find owner for {}".format(domain)})

	# Obtain owner info and send email
	owner = siteInfo.name
	email = siteInfo.email
	try:
		send_mail(
			"Please Confirm Email Address",
			'''Hello {},
			Thank you for using edge-cms on your domain: {}'''.format(owner, domain),
			"DoNotReply@edge-cms.com",
			[email],
			fail_silently=False)
	except smtplib.SMTPException:
		return JsonResponse({"status": "Failure", "message": "Email not sent"})

	return JsonResponse({"status": "Success", "message": "Email sent"})
