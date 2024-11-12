import { View, Text, ScrollView, Image, StyleSheet, FlatList, Button } from 'react-native'

import { useContext, useEffect, useState } from 'react';
import { router, useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';

export default function HomeTabScreen() {

    const {user} = useContext(AuthContext)
    
    
    const [turnos, setTurnos] = useState([])
    const [especialistas, setEspecialistas] = useState([])
    const router = useRouter();

//esto esta de ejemplo para que haya algo pero tiene que estar lo de los turnos o especialistas(crear las tablas en la mockapi)
    useEffect(() => {
      const fetchUsers = async () => {
        try {
            const respuesta = await fetch('https://randomuser.me/api/?results=5')
            const data = await respuesta.json()
            setEspecialistas(data.results)
        } catch (error) {
            console.error('error: ', error)
        }
      }

      fetchUsers()
    }, [])
    

  return (
    <View style={styles.container}>
        {
            user.admin ? (
                <>
        <Text style={styles.name}>Home Screen</Text>
        <Button title={"Añadir Especialista"} onPress={() => router.push('/nuevo_especialista')} />
        <FlatList 
        data={especialistas}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({item}) => (
                <View key={item.login.uuid} style={styles.userContainer}>
                    <Image source={{ uri: item.picture.large}} style={styles.image}/>
                    <View style={styles.infoContainer}>
                        <Text style={styles.name}>{item.name.first} {item.name.last}</Text>
                        <Text style={styles.detalle}>Especialidad: {item.especialidad}</Text>
                        <Text style={styles.detalle}>Edad: {item.dob.age}</Text>
                    </View>
                </View>
            )}
        />
                </>
            ):(
                <>
        <Text style={styles.name}>Home Screen</Text>
        <Button title={"Nuevo Turno"} onPress={() => router.push('/nuevo_turno')} />
        <FlatList 
        data={turnos}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({item}) => (
                <View key={item.id} style={styles.userContainer}>
                    <Image source={{ uri: item.picture.large}} style={styles.image}/>
                    <View style={styles.infoContainer}>
                        <Text style={styles.name}>Fecha: {item.fecha}</Text>
                        <Text style={styles.detalle}>Hora: {item.hora}</Text>
                        <Text style={styles.detalle}>Medico: {especialistas.find(especialista => especialista.id == item.idMedico)}</Text>
                    </View>
                </View>
            )}
        />
        <View>
            Mi Perfil
            {user.dni}
            {user.mail}
            {user.telefono}
            <Button>Editar</Button>
            <Button>Cerrar Sesion</Button>
            <Button>Cambiar Contraseña</Button>
        </View>
                </>
            )
        }
        
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'wheat',
        padding: 30
    },
    userContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#c1bdbd',
        padding: 15,
        marginBottom: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    image:{
        width: 70,
        height: 70,
        borderRadius: 35,
        marginRight: 15,
    },
    infoContainer: {
        flex: 1
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333'
    },
    detalle:{
        fontSize: 16,
        color: '#666'
    }
    
})
