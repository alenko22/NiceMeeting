from django.core.management import BaseCommand
from api.loader import EventLoader

class Command(BaseCommand):
    def handle(self, *args, **options):
        loader = EventLoader()
        count = loader.load_to_db()

        self.stdout.write(
            self.style.SUCCESS(f"{count} events loaded")
        )