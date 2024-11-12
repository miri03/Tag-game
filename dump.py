	async def sendWinner(self, event):
		group_name, consumers = await self.groupName()
		await self.send(text_data=json.dumps({
			'action': 'winner',
			'winner': games[group_name].winner,
			'winner_color': games[group_name].winner_color
		}))

	async def disconnect(self, code):
		self.is_open = False
		group_name, consumers = await self.groupName()
		print(group_name, consumers)

		if not games[group_name].winner:
			print("disconnected", self.channel_name)
			if self.channel_name == consumers[0]:
				games[group_name].winner = games[group_name].players[1].name
				games[group_name].winner_color = "2px 0px 8px rgba(32, 174, 221, 0.8)"
			elif self.channel_name == consumers[1]:
				games[group_name].winner = games[group_name].players[0].name
				games[group_name].winner_color = "2px 0px 8px rgba(207, 62, 90, 0.8)"
			
			await self.channel_layer.group_send(group_name, {"type": "sendWinner"})
			await asyncio.sleep(0.05)

			if self.channel_name == consumers[0]:
				consumers[1].close()
			else:
				consumers[0].close()
			#delete everything from the group
			# for consumer in consumers:
			# 	await self.channel_layer.group_discard(
			# 		group_name,
			# 		consumer
			# 	)
		else:
			print("++++hola++++")
			await self.channel_layer.group_discard(
				group_name,
				self.channel_name
			)
